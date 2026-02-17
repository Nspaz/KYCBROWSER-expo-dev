import Constants from 'expo-constants';

const appOwnership = Constants.appOwnership ?? 'unknown';

/**
 * Dev Build Only – Expo Go is not supported.
 * IS_EXPO_GO is always false; all native modules are assumed available.
 */
export const IS_EXPO_GO = false;
export const IS_DEV_CLIENT = (appOwnership as string) === 'guest';
export const IS_STANDALONE = (appOwnership as string) === 'standalone';
export const SUPPORTS_CUSTOM_NATIVE_MODULES = true;
export const EXPO_RUNTIME = appOwnership;
