import type {
  IncomingCallNotificationOptions,
  IncomingCallEventMap,
  VoipTokenPayload,
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
  registerVoipPush(): void;
  unregisterVoipPush(): void;
  onVoipToken(handler: (payload: VoipTokenPayload) => void): void;
  offVoipToken(): void;
}
