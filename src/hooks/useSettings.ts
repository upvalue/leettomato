import { useCallback, useMemo } from 'react';
import { AppSettings } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SETTINGS: AppSettings = {
  designThresholdMin: 10,
  codingThresholdMin: 20,
  soundEnabled: false,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'leettomato-settings',
    DEFAULT_SETTINGS,
  );

  // Merge with defaults in case new keys are added in the future
  const merged = useMemo(() => ({ ...DEFAULT_SETTINGS, ...settings }), [settings]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings({ ...merged, [key]: value });
    },
    [merged, setSettings],
  );

  const designThresholdMs = merged.designThresholdMin * 60 * 1000;
  const codingThresholdMs = merged.codingThresholdMin * 60 * 1000;

  return {
    settings: merged,
    updateSetting,
    designThresholdMs,
    codingThresholdMs,
  };
}
