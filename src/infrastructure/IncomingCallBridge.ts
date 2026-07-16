import { Platform, DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import type { IncomingCall } from '../IncomingCall.nitro';
import type { IIncomingCallBridge } from '../domain/interfaces/IIncomingCallBridge';
import type {
  IncomingCallNotificationOptions,
  IncomingCallEventMap,
  CallAnswerPayload,
  CallDeclinePayload,
} from '../domain/types';

const isAndroid = Platform.OS === 'android';

// Native Event Mapping
enum RNNotificationEvent {
  AnswerAction = 'RNNotificationAnswerAction',
  EndCallAction = 'RNNotificationEndCallAction',
}

const EVENT_TYPE_MAP = {
  answer: RNNotificationEvent.AnswerAction,
  endCall: RNNotificationEvent.EndCallAction,
} as const;

export class IncomingCallBridge implements IIncomingCallBridge {
  private readonly hybridObject = isAndroid
    ? NitroModules.createHybridObject<IncomingCall>('IncomingCall')
    : null;

  private readonly eventHandlers = new Map<
    keyof IncomingCallEventMap,
    EmitterSubscription
  >();

  public show(
    uuid: string,
    avatar: string | null,
    timeoutMs: number | null,
    options: IncomingCallNotificationOptions
  ): void {
    if (isAndroid && this.hybridObject) {
      this.hybridObject.displayNotification(
        uuid,
        avatar,
        timeoutMs ?? 0,
        {
          channelId: options.channelId,
          channelName: options.channelName,
          notificationIcon: options.notificationIcon,
          notificationTitle: options.notificationTitle,
          notificationBody: options.notificationBody ?? undefined,
          answerText: options.answerText,
          declineText: options.declineText,
          notificationColor: options.notificationColor ?? undefined,
          notificationSound: options.notificationSound ?? undefined,
          mainComponent: options.mainComponent ?? undefined,
          isVideo: options.isVideo ?? undefined,
          payload: options.payload ?? undefined,
        }
      );
    }
  }

  public dismiss(): void {
    if (isAndroid && this.hybridObject) {
      this.hybridObject.hideNotification();
    }
  }

  public backToApp(): void {
    if (isAndroid && this.hybridObject) {
      this.hybridObject.backToApp();
    }
  }

  public decline(uuid: string, payload?: string): void {
    this.dismiss();
    const data: CallDeclinePayload = {
      callUUID: uuid,
      endAction: 'ACTION_REJECTED_CALL',
      payload,
    };
    DeviceEventEmitter.emit(RNNotificationEvent.EndCallAction, data);
  }

  public answer(uuid: string, payload?: string): void {
    this.dismiss();
    const data: CallAnswerPayload = {
      callUUID: uuid,
      payload,
    };
    DeviceEventEmitter.emit(RNNotificationEvent.AnswerAction, data);
  }

  public on<T extends keyof IncomingCallEventMap>(
    type: T,
    handler: (payload: IncomingCallEventMap[T]) => void
  ): void {
    if (!isAndroid) return;

    // Clean up existing listener of the same type before subscribing again
    this.off(type);

    const subscription = DeviceEventEmitter.addListener(
      EVENT_TYPE_MAP[type],
      handler
    );
    this.eventHandlers.set(type, subscription);
  }

  public off(type: keyof IncomingCallEventMap): void {
    if (!isAndroid) return;

    const subscription = this.eventHandlers.get(type);
    if (subscription) {
      subscription.remove();
      this.eventHandlers.delete(type);
    }
  }
}

// Export a singleton instance for global use
export const incomingCall = new IncomingCallBridge();
