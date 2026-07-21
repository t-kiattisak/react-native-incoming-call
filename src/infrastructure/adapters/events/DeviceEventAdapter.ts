import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import type { IIncomingCallEventAdapter } from '../../../domain/interfaces/IIncomingCallEventAdapter';
import type { IncomingCallEventMap, VoipTokenPayload } from '../../../domain/types';
import {
  INCOMING_CALL_EVENT_TYPE_MAP,
  NativeIncomingCallEvents,
} from '../constants/nativeEvents';

type EventHandlerKey = keyof IncomingCallEventMap | 'voipToken';

export class DeviceEventAdapter implements IIncomingCallEventAdapter {
  private readonly eventHandlers = new Map<EventHandlerKey, EmitterSubscription>();

  public on<T extends keyof IncomingCallEventMap>(
    type: T,
    handler: (payload: IncomingCallEventMap[T]) => void
  ): void {
    this.off(type);

    const subscription = DeviceEventEmitter.addListener(
      INCOMING_CALL_EVENT_TYPE_MAP[type],
      handler
    );
    this.eventHandlers.set(type, subscription);
  }

  public off(type: keyof IncomingCallEventMap): void {
    const subscription = this.eventHandlers.get(type);
    if (subscription) {
      subscription.remove();
      this.eventHandlers.delete(type);
    }
  }

  public onVoipToken(handler: (payload: VoipTokenPayload) => void): void {
    this.offVoipToken();

    const subscription = DeviceEventEmitter.addListener(
      NativeIncomingCallEvents.VoipToken,
      handler
    );
    this.eventHandlers.set('voipToken', subscription);
  }

  public offVoipToken(): void {
    const subscription = this.eventHandlers.get('voipToken');
    if (subscription) {
      subscription.remove();
      this.eventHandlers.delete('voipToken');
    }
  }
}
