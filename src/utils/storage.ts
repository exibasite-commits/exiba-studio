import { BioSiteConfig } from '../types';
import { TEMPLATES } from '../data/templates';

const STORAGE_KEY = 'biolink_studio_active_config_v4';

export function loadSavedConfig(): BioSiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profile && parsed.blocks) {
        return {
          ...TEMPLATES[0].config,
          ...parsed,
          profile: {
            ...TEMPLATES[0].config.profile,
            ...parsed.profile,
            banner: parsed.profile.banner || TEMPLATES[0].config.profile.banner,
          },
          theme: {
            ...TEMPLATES[0].config.theme,
            ...parsed.theme,
          },
        };
      }
    }
  } catch (err) {
    console.error('Error loading config from localStorage:', err);
  }
  // Default to clean creator template
  return TEMPLATES[0].config;
}

export function saveConfig(config: BioSiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving config to localStorage:', err);
  }
}
