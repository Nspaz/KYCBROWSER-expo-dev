/**
 * Expo Environment Detection
 *
 * This app is configured as a 100% Expo Dev Build.
 * Expo Go is not supported – all native modules are always available.
 */

/** Always false – this app only runs as a development build. */
export const IS_EXPO_GO = false;

/** Always true in a dev build. */
export const IS_DEV_CLIENT = true;

export const IS_STANDALONE = false;

/** Always true – custom native modules are available in dev builds. */
export const SUPPORTS_CUSTOM_NATIVE_MODULES = true;

export const EXPO_RUNTIME = 'dev-client';
