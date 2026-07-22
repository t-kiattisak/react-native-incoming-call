import type { IIncomingCallNativeAdapter } from '../../../domain/interfaces/IIncomingCallNativeAdapter';
import type { IncomingCallNotificationOptions } from '../../../domain/types';

export class NoOpNativeCallAdapter implements IIncomingCallNativeAdapter {
  public show(
    _uuid: string,
    _avatar: string | null,
    _timeoutMs: number | null,
    _options: IncomingCallNotificationOptions
  ): void {}

  public dismiss(): void {}

  public backToApp(): void {}

  public registerVoipPush(): void {}

  public unregisterVoipPush(): void {}
}
