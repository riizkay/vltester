// konfigurasi aplikasi
import { loadSettings, DEFAULT_SETTINGS } from '../utils/settingsUtils';

// load settings dari storage atau gunakan default
let CONFIG = DEFAULT_SETTINGS;

// function untuk load settings secara async
export const loadConfig = async () => {
  try {
    CONFIG = await loadSettings();
    console.log('Config loaded from storage:', CONFIG);
  } catch (error) {
    console.error('Error loading config:', error);
    CONFIG = DEFAULT_SETTINGS;
  }
};

// export config yang bisa diakses secara sync
export { CONFIG };

// export default CONFIG;
