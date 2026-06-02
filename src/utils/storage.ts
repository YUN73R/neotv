let memoryStorage: Record<string, string> = {};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(key);
      } catch {
        return memoryStorage[key] || null;
      }
    } catch {
      return memoryStorage[key] || null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        memoryStorage[key] = value;
        return;
      }
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, value);
        memoryStorage[key] = value;
      } catch {
        memoryStorage[key] = value;
      }
    } catch {
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        delete memoryStorage[key];
        return;
      }
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(key);
        delete memoryStorage[key];
      } catch {
        delete memoryStorage[key];
      }
    } catch {
      delete memoryStorage[key];
    }
  },

  clear: async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
        memoryStorage = {};
        return;
      }
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.clear();
        memoryStorage = {};
      } catch {
        memoryStorage = {};
      }
    } catch {
      memoryStorage = {};
    }
  },
};

export default storage;
