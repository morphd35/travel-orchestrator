/**
 * Server-only utilities
 * These functions will only execute on the server-side
 */

export function isServer(): boolean {
    return typeof window === 'undefined';
}

export function runOnServerOnly<T>(fn: () => T): T | undefined {
    if (isServer()) {
        return fn();
    }
    return undefined;
}

export function runOnServerOnlyAsync<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (isServer()) {
        return fn();
    }
    return Promise.resolve(undefined);
}

// Create server-only instance wrapper
export function createServerOnlyInstance<T extends object>(
    ClassConstructor: new (...args: any[]) => T,
    ...args: any[]
): T {
    if (!isServer()) {
        // Return a no-op proxy for client-side
        return new Proxy({} as T, {
            get(): any { return () => undefined; },
            set(): boolean { return true; }
        });
    }
    return new ClassConstructor(...args);
}
