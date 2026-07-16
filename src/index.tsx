import { incomingCall } from './infrastructure/IncomingCallBridge';
import type { IncomingCallNotificationOptions, IncomingCallEventMap } from './domain/types';

// Concrete wrapper functions for backward compatibility
export function show(
  uuid: string,
  avatar: string | null,
  timeoutMs: number | null,
  options: IncomingCallNotificationOptions
): void {
  incomingCall.show(uuid, avatar, timeoutMs, options);
}

export function dismiss(): void {
  incomingCall.dismiss();
}

export function backToApp(): void {
  incomingCall.backToApp();
}

export function decline(uuid: string, payload?: string): void {
  incomingCall.decline(uuid, payload);
}

export function answer(uuid: string, payload?: string): void {
  incomingCall.answer(uuid, payload);
}

export function on<T extends keyof IncomingCallEventMap>(
  type: T,
  handler: (payload: IncomingCallEventMap[T]) => void
): void {
  incomingCall.on(type, handler);
}

export function off(type: keyof IncomingCallEventMap): void {
  incomingCall.off(type);
}

// Export Domain Types & Ports
export type * from './domain/types';
export type { IIncomingCallBridge } from './domain/interfaces/IIncomingCallBridge';

// Export Presentation Hooks
export * from './presentation/hooks/useIncomingCall';
export * from './presentation/hooks/useIncomingCallListener';

// Default export is the infrastructure singleton implementation
export default incomingCall;
