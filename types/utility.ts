export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

export function createSuccess<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function createFailure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

export type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export function createIdleState(): LoadingState<never> {
  return { status: 'idle' };
}

export function createLoadingState(): LoadingState<never> {
  return { status: 'loading' };
}

export function createSuccessState<T>(data: T): LoadingState<T> {
  return { status: 'success', data };
}

export function createErrorState(error: Error): LoadingState<never> {
  return { status: 'error', error };
}

export type EventCallback<T = void> = (data: T) => void;
export type AsyncEventCallback<T = void> = (data: T) => Promise<void>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type MergeTypes<T, U> = Omit<T, keyof U> & U;

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

export function exhaustiveCheck(x: never): void {
  console.error(`Unhandled case: ${x}`);
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return value !== null && value !== undefined && value !== '';
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
