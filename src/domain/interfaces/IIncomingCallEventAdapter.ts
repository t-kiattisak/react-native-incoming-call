import type { IncomingCallEventMap, VoipTokenPayload } from '../types';

export interface IIncomingCallEventAdapter {
  on<T extends keyof IncomingCallEventMap>(
    type: T,
    handler: (payload: IncomingCallEventMap[T]) => void
  ): void;
  off(type: keyof IncomingCallEventMap): void;
  onVoipToken(handler: (payload: VoipTokenPayload) => void): void;
  offVoipToken(): void;
}
