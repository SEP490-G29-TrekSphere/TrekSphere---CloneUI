import apiClient, { type ApiResponse, handleResponse } from '@/config/apiClient';

export interface SystemSettingsData {
  maxRainfall: number;
  maxWindSpeed: number;
  minTemperature: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  backupInterval: string;
  require2fa: boolean;
}

const DEFAULT_SETTINGS: SystemSettingsData = {
  maxRainfall: 50,
  maxWindSpeed: 40,
  minTemperature: 5,
  emailNotifications: true,
  pushNotifications: true,
  backupInterval: 'daily',
  require2fa: true,
};

// Fallback logic to localStorage so that changes persist even when backend API is missing
const getLocalSettings = (): SystemSettingsData => {
  const data = localStorage.getItem('ts_system_settings');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

const saveLocalSettings = (settings: SystemSettingsData) => {
  localStorage.setItem('ts_system_settings', JSON.stringify(settings));
};

export const systemSettingsService = {
  /** Get global system configuration settings. */
  getSettings: async (): Promise<ApiResponse<SystemSettingsData>> => {
    try {
      // Attempt request to backend settings API
      const response = await apiClient.get<SystemSettingsData>('/admin/settings');
      return handleResponse<SystemSettingsData>(response);
    } catch (err) {
      console.warn(
        '[systemSettingsService] Failed to fetch settings from API, using fallback:',
        err
      );
      // Fallback response using local storage / default settings
      return {
        data: getLocalSettings(),
        status: 200,
      };
    }
  },

  /** Update global system configuration settings. */
  updateSettings: async (
    settings: SystemSettingsData
  ): Promise<ApiResponse<SystemSettingsData>> => {
    try {
      // Attempt to save to backend settings API
      const response = await apiClient.put<SystemSettingsData>('/admin/settings', settings);
      const res = handleResponse<SystemSettingsData>(response);
      if (res.data) {
        saveLocalSettings(res.data);
      }
      return res;
    } catch (err) {
      console.warn(
        '[systemSettingsService] Failed to save settings to API, saving to fallback local storage:',
        err
      );
      // Save locally as fallback and return success
      saveLocalSettings(settings);
      return {
        data: settings,
        status: 200,
        message: 'Cập nhật cấu hình thành công (offline)',
      };
    }
  },
};
