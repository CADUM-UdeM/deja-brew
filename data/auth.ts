import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

let cachedToken: string | null = null;
let cachedUser: any | null = null;

export const getAuthToken = async () => {
  if (cachedToken !== null) return cachedToken;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  cachedToken = token;
  return token;
};

export const getAuthUser = async <T = any>() => {
  if (cachedUser !== null) return cachedUser as T;
  const raw = await AsyncStorage.getItem(USER_KEY);
  try {
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
    await AsyncStorage.removeItem(USER_KEY);
  }
  return cachedUser as T;
};

export const setAuth = async (token: string, user: any) => {
  cachedToken = token;
  cachedUser = user;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const setAuthUser = async (user: any) => {
  cachedUser = user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = async () => {
  cachedToken = null;
  cachedUser = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};
