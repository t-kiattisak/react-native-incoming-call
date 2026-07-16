import type {
  IncomingCallNotificationOptions,
  IncomingCallEventMap,
} from '../types';

export interface IIncomingCallBridge {
  show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void;
  dismiss(): void;
  backToApp(): void;
  decline(uuid: string, payload?: string): void;
  answer(uuid: string, payload?: string): void;
  on<T extends keyof IncomingCallEventMap>(
    type: T,
    handler: (payload: IncomingCallEventMap[T]) => void
  ): void;
  off(type: keyof IncomingCallEventMap): void;
}
