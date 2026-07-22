import type { IncomingCallNotificationOptions } from '../types';

export interface IIncomingCallNativeAdapter {
  show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void;
  dismiss(): void;
  backToApp(): void;
  registerVoipPush(): void;
  unregisterVoipPush(): void;
}
