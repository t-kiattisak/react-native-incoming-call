import { NitroModules } from 'react-native-nitro-modules';
import type { IncomingCall } from '../../../IncomingCall.nitro';
import type { IncomingCallNotificationOptions } from '../../../domain/types';
import { mapForegroundOptions } from './mapForegroundOptions';

export class NitroHybridClient {
  private readonly hybrid: IncomingCall | null;

  constructor(hybrid: IncomingCall | null) {
    this.hybrid = hybrid;
  }

  public static create(): NitroHybridClient {
    const hybrid = NitroModules.createHybridObject<IncomingCall>('IncomingCall');
    return new NitroHybridClient(hybrid);
  }

  public show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void {
    this.hybrid?.displayNotification(
      uuid,
      avatar,
      timeoutMs ?? 0,
      mapForegroundOptions(options)
    );
  }

  public dismiss(): void {
    this.hybrid?.hideNotification();
  }

  public backToApp(): void {
    this.hybrid?.backToApp();
  }

  public registerVoipPush(): void {
    this.hybrid?.registerVoipPush();
  }

  public unregisterVoipPush(): void {
    this.hybrid?.unregisterVoipPush();
  }
}
