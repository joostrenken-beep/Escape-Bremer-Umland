import { useState } from 'preact/hooks';
import { ReadAloud } from '../components/ReadAloud';
import type { AudioStepSource } from '../content/types';
import { mediaUrl } from '../content/media';
import { leveled, localize } from '../i18n/text';
import { getLang, ui } from '../i18n/ui';
import { CodeAnswer } from './CodeAnswer';
import type { PuzzleProps } from './types';

/** Zeugenaussage anhören (oder als Abschrift lesen), dann Frage beantworten. */
export function AudioPuzzle(props: PuzzleProps<AudioStepSource>) {
  const { step, tour, session } = props;
  const [showText, setShowText] = useState(false);
  const lang = getLang();
  const speech = leveled(step.speech, session.difficulty, lang);
  return (
    <div class="puzzle">
      <section class="card witness">
        <p class="eyebrow">🎙 {step.speaker ? localize(step.speaker, lang) : ui('witness')}</p>
        <ReadAloud text={speech} audioSrc={step.audio ? mediaUrl(tour.id, step.audio) : undefined} label={ui('listen')} />
        <button class="btn btn-ghost btn-small" onClick={() => setShowText(!showText)} aria-expanded={showText}>
          {showText ? ui('hideTranscript') : ui('showTranscript')}
        </button>
        {showText && <blockquote class="transcript">{speech}</blockquote>}
      </section>
      <CodeAnswer {...props} />
    </div>
  );
}
