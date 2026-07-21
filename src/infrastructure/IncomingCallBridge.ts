import type { IIncomingCallBridge } from '../domain/interfaces/IIncomingCallBridge';
import type { IIncomingCallEventAdapter } from '../domain/interfaces/IIncomingCallEventAdapter';
import type { IIncomingCallNativeAdapter } from '../domain/interfaces/IIncomingCallNativeAdapter';
import type {
  IncomingCallNotificationOptions,
  IncomingCallEventMap,
  VoipTokenPayload,
} from '../domain/types';
import {
  createPlatformAdapters,
  type PlatformAdapters,
} from './adapters/createPlatformAdapters';
import {
  emitProgrammaticAnswer,
  emitProgrammaticDecline,
} from './adapters/programmaticCallActions';

export class IncomingCallBridge implements IIncomingCallBridge {
  private readonly native: IIncomingCallNativeAdapter;
  private readonly events: IIncomingCallEventAdapter;

  constructor(adapters: PlatformAdapters = createPlatformAdapters()) {
    this.native = adapters.native;
    this.events = adapters.events;
  }

  public show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void {
    this.native.show(uuid, avatar, timeoutMs, options);
  }

  public dismiss(): void {
    this.native.dismiss();
  }

  public backToApp(): void {
    this.native.backToApp();
  }

  public registerVoipPush(): void {
    this.native.registerVoipPush();
  }

  public unregisterVoipPush(): void {
    this.native.unregisterVoipPush();
  }

  public decline(uuid: string, payload?: string): void {
    this.dismiss();
    emitProgrammaticDecline({
      callUUID: uuid,
      endAction: 'ACTION_REJECTED_CALL',
      payload,
    });
  }

  public answer(uuid: string, payload?: string): void {
    this.dismiss();
    emitProgrammaticAnswer({
      callUUID: uuid,
      payload,
    });
  }

  public on<T extends keyof IncomingCallEventMap>(
    type: T,
    handler: (payload: IncomingCallEventMap[T]) => void
  ): void {
    this.events.on(type, handler);
  }

  public off(type: keyof IncomingCallEventMap): void {
    this.events.off(type);
  }

  public onVoipToken(handler: (payload: VoipTokenPayload) => void): void {
    this.events.onVoipToken(handler);
  }

  public offVoipToken(): void {
    this.events.offVoipToken();
  }
}

export const incomingCall = new IncomingCallBridge();
