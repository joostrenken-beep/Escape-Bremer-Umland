import { scores } from '../adapters';
import { formatDuration } from '../game/useGame';
import { useAsync } from '../hooks';
import { ui } from '../i18n/ui';

/** Bisherige Ergebnisse dieser Tour (heute: nur dieses Gerät). */
export function Results({ tourId }: { tourId: string }) {
  const [state] = useAsync(() => scores.list(tourId), [tourId]);
  if (state.status !== 'ok' || state.data.length === 0) return null;
  const list = state.data.filter((r) => !r.usedTestMode).slice(0, 5);
  if (!list.length) return null;
  return (
    <section class="card results">
      <h2 class="h3">🏆 {ui('results')}</h2>
      <ol>
        {list.map((r) => (
          <li key={r.finishedAt}>
            <span>
              <strong>{r.team || ui('resultsNoName')}</strong>
              <span class="small"> · {new Date(r.finishedAt).toLocaleDateString('de-DE')}</span>
            </span>
            <span class="mono">
              ★ {r.score} · ⏱ {formatDuration(r.timeMs)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
