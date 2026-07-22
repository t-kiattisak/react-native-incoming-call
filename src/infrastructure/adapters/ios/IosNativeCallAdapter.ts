import type { IIncomingCallNativeAdapter } from '../../../domain/interfaces/IIncomingCallNativeAdapter';
import type { IncomingCallNotificationOptions } from '../../../domain/types';
import type { NitroHybridClient } from '../nitro/NitroHybridClient';

export class IosNativeCallAdapter implements IIncomingCallNativeAdapter {
  constructor(private readonly client: NitroHybridClient) {}

  public show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void {
    this.client.show(uuid, avatar, timeoutMs, options);
  }

  public dismiss(): void {
    this.client.dismiss();
  }

  public backToApp(): void {
    this.client.backToApp();
  }

  public registerVoipPush(): void {
    this.client.registerVoipPush();
  }

  public unregisterVoipPush(): void {
    this.client.unregisterVoipPush();
  }
}
