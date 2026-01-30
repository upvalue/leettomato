import { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-tn-muted hover:text-tn-fg transition-colors text-sm"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        Settings
      </button>

      {open && (
        <div className="mt-3 p-4 bg-tn-bg-hl rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-tn-fg w-40">Design threshold</label>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.designThresholdMin}
              onChange={(e) =>
                onUpdate('designThresholdMin', clamp(Number(e.target.value), 1, 120))
              }
              className="w-20 px-2 py-1 bg-tn-bg text-tn-fg rounded border border-tn-muted text-sm text-center"
            />
            <span className="text-sm text-tn-muted">min</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-tn-fg w-40">Coding threshold</label>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.codingThresholdMin}
              onChange={(e) =>
                onUpdate('codingThresholdMin', clamp(Number(e.target.value), 1, 120))
              }
              className="w-20 px-2 py-1 bg-tn-bg text-tn-fg rounded border border-tn-muted text-sm text-center"
            />
            <span className="text-sm text-tn-muted">min</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-tn-fg w-40">Sound effects</label>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdate('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-tn-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
