import { ui } from '../i18n/ui';
import { useSettings } from '../settings';

export function SettingsScreen({ onResetAll }: { onResetAll: () => void }) {
  const { settings, update } = useSettings();
  return (
    <main class="screen">
      <a class="back" href="#/">
        ‹ {ui('back')}
      </a>
      <h1>⚙️ {ui('settings')}</h1>
      <label class="card switch">
        <span>
          <strong>🧪 {ui('testMode')}</strong>
          <span class="small">{ui('testModeHelp')}</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={settings.testMode}
          onChange={(e) => update({ testMode: (e.target as HTMLInputElement).checked })}
        />
      </label>
      {settings.testMode && (
        <a class="btn btn-secondary" href="#/dev">
          🛠 Entwickler-Ansicht (Prüfliste vor Ort)
        </a>
      )}
      <button
        class="btn btn-ghost"
        onClick={() => {
          if (confirm(ui('resetConfirm'))) onResetAll();
        }}
      >
        {ui('resetAll')}
      </button>
    </main>
  );
}
