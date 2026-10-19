import { useEffect, useState } from 'preact/hooks';
import { getLang, ui } from '../i18n/ui';

const supported = () => typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';

/**
 * Liest einen Text vor – mit Audiodatei, falls vorhanden, sonst mit der
 * Sprachausgabe des Geräts (funktioniert auf dem iPhone auch offline).
 */
export function ReadAloud({ text, audioSrc }: { text: string; audioSrc?: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stop(), [text]);

  if (!audioSrc && !supported()) return null;
  if (audioSrc) {
    return <audio class="story-audio" controls preload="none" src={audioSrc} aria-label={ui('readAloud')} />;
  }

  function stop() {
    if (supported()) speechSynthesis.cancel();
    setSpeaking(false);
  }

  const start = () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = getLang() === 'de' ? 'de-DE' : 'en-GB';
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
    setSpeaking(true);
  };

  return (
    <button class="btn btn-small btn-secondary read-aloud" onClick={speaking ? stop : start} aria-pressed={speaking}>
      {speaking ? `⏹ ${ui('stopReading')}` : `🔊 ${ui('readAloud')}`}
    </button>
  );
}
