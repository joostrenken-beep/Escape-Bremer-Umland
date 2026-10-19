/**
 * Kamera – nur nach Tipp, nur solange sichtbar, nur lokal.
 * Das Bild wird ausschließlich in einem <video>-Element angezeigt;
 * es wird nichts aufgenommen, gespeichert oder hochgeladen.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

export type CameraStatus = 'off' | 'starting' | 'on' | 'denied' | 'unavailable';

export function useCamera(active: boolean) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>('off');

  useEffect(() => {
    if (!active) return setStatus('off');
    if (!navigator.mediaDevices?.getUserMedia) return setStatus('unavailable');
    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus('starting');
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
        setStatus('on');
      })
      .catch((e: DOMException) => setStatus(e.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop()); // Kamera wirklich ausschalten
    };
  }, [active]);

  return { video, status };
}
