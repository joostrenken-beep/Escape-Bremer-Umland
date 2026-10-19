/**
 * Ermittlerurkunde als PNG – wird komplett auf dem Gerät gezeichnet (Canvas),
 * nichts wird hochgeladen. Teilen über das Teilen-Menü des Handys.
 */

export interface CertificateData {
  team: string;
  tourTitle: string;
  town: string;
  difficulty: string;
  score: number;
  maxScore: number;
  time: string;
  date: string;
  imageUrl?: string;
}

const W = 1080;
const H = 1350;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lineH;
    } else line = test;
  }
  ctx.fillText(line, x, y);
  return y + lineH;
}

export async function drawCertificate(d: CertificateData): Promise<HTMLCanvasElement> {
  await document.fonts?.ready;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const stamp = "'Special Elite', 'Courier New', monospace";
  const serif = 'Georgia, serif';

  // Papier
  ctx.fillStyle = '#f3ead7';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#3b2a1e';
  ctx.lineWidth = 10;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 3;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9e2b25';
  ctx.font = `64px ${stamp}`;
  ctx.fillText('ERMITTLERURKUNDE', W / 2, 180);

  ctx.fillStyle = '#4a3f35';
  ctx.font = `34px ${serif}`;
  ctx.fillText('Hiermit wird bestätigt, dass', W / 2, 270);

  ctx.fillStyle = '#1d1712';
  ctx.font = `bold 76px ${serif}`;
  wrap(ctx, d.team || 'unser Ermittlerteam', W / 2, 370, W - 200, 84);

  ctx.fillStyle = '#4a3f35';
  ctx.font = `34px ${serif}`;
  let y = wrap(ctx, `den Fall „${d.tourTitle}“ in ${d.town} erfolgreich gelöst hat.`, W / 2, 470, W - 220, 46);

  // Bild der Mondnacht
  if (d.imageUrl) {
    const img = await loadImage(d.imageUrl);
    if (img) {
      const s = 330;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18;
      ctx.drawImage(img, W / 2 - s / 2, y + 10, s, s);
      ctx.restore();
      ctx.strokeStyle = '#7a5a2e';
      ctx.lineWidth = 14;
      ctx.strokeRect(W / 2 - s / 2 - 7, y + 3, s + 14, s + 14);
      y += s + 60;
    }
  }

  // Werte
  ctx.font = `30px ${serif}`;
  ctx.fillStyle = '#4a3f35';
  const cols = [
    ['Punkte', `${d.score} / ${d.maxScore}`],
    ['Spielzeit', d.time],
    ['Stufe', d.difficulty],
  ];
  cols.forEach(([label, value], i) => {
    const x = W / 2 + (i - 1) * 300;
    ctx.fillStyle = '#4a3f35';
    ctx.font = `28px ${serif}`;
    ctx.fillText(label, x, y + 20);
    ctx.fillStyle = '#1d1712';
    ctx.font = `bold 44px ${serif}`;
    ctx.fillText(value, x, y + 74);
  });

  // Stempel
  ctx.save();
  ctx.translate(W - 210, H - 175);
  ctx.rotate(-0.25);
  ctx.scale(0.85, 0.85);
  ctx.strokeStyle = 'rgba(158,43,37,0.85)';
  ctx.fillStyle = 'rgba(158,43,37,0.85)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `38px ${stamp}`;
  ctx.fillText('FALL', 0, -6);
  ctx.fillText('GELÖST', 0, 36);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#4a3f35';
  ctx.font = `28px ${serif}`;
  ctx.fillText(d.date, 110, H - 150);
  ctx.font = `24px ${stamp}`;
  ctx.fillText('Ermittlerakte · Escape-Touren im Bremer Umland', 110, H - 110);
  return c;
}

/** Teilen (Handy-Menü) oder – falls nicht möglich – herunterladen. */
export async function shareCanvas(canvas: HTMLCanvasElement, fileName: string, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return 'cancelled';
  const file = new File([blob], fileName, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
