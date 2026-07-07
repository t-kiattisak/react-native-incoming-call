import { Platform, DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import type { IncomingCall } from './IncomingCall.nitro';

const isAndroid = Platform.OS === 'android';

// Load the Nitro HybridObject
const IncomingCallHybrid = isAndroid
  ? NitroModules.createHybridObject<IncomingCall>('IncomingCall')
  : null;

// Native Event Mapping
enum RNNotificationEvent {
  AnswerAction = 'RNNotificationAnswerAction',
  EndCallAction = 'RNNotificationEndCallAction',
}

const EVENT_TYPE_MAP = {
  answer: RNNotificationEvent.AnswerAction,
  endCall: RNNotificationEvent.EndCallAction,
} as const;

// --- Types & Interfaces ---
export interface IncomingCallNotificationOptions {
  channelId: string;
  channelName: string;
  notificationIcon: string;
  notificationTitle: string;
  notificationBody?: string | null;
  answerText: string;
  declineText: string;
  notificationColor?: string;
  notificationSound?: string;
  mainComponent?: string;
  isVideo?: boolean;
  payload?: Record<string, string>;
}

export interface CallAnswerPayload {
  callUUID: string;
  payload?: string;
}

export interface CallDeclinePayload {
  callUUID: string;
  payload?: string;
  endAction: 'ACTION_REJECTED_CALL' | 'ACTION_HIDE_CALL';
}

interface IncomingCallEventMap {
  answer: CallAnswerPayload;
  endCall: CallDeclinePayload;
}

// Registry to track active subscriptions
const eventHandlers = new Map<
  keyof IncomingCallEventMap,
  EmitterSubscription
>();

// --- Core API Implementation ---

/**
 * Displays a full-screen incoming call notification (Android only).
 */
export function show(
  uuid: string,
  avatar: string | null,
  timeoutMs: number | null,
  options: IncomingCallNotificationOptions
): void {
  if (isAndroid && IncomingCallHybrid) {
    IncomingCallHybrid.displayNotification(
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

/**
 * Dismisses the active incoming call notification (Android only).
 */
export function dismiss(): void {
  if (isAndroid && IncomingCallHybrid) {
    IncomingCallHybrid.hideNotification();
  }
}

/**
 * Brings the host application back into the foreground (Android only).
 */
export function backToApp(): void {
  if (isAndroid && IncomingCallHybrid) {
    IncomingCallHybrid.backToApp();
  }
}

/**
 * Declines the incoming call, dismissing the notification and emitting the endCall event.
 */
export function decline(uuid: string, payload?: string): void {
  dismiss();
  const data: CallDeclinePayload = {
    callUUID: uuid,
    endAction: 'ACTION_REJECTED_CALL',
    payload,
  };
  DeviceEventEmitter.emit(RNNotificationEvent.EndCallAction, data);
}

/**
 * Answers the incoming call, dismissing the notification and emitting the answer event.
 */
export function answer(uuid: string, payload?: string): void {
  dismiss();
  const data: CallAnswerPayload = {
    callUUID: uuid,
    payload,
  };
  DeviceEventEmitter.emit(RNNotificationEvent.AnswerAction, data);
}

/**
 * Subscribes to native incoming call events ('answer' or 'endCall').
 */
export function on<T extends keyof IncomingCallEventMap>(
  type: T,
  handler: (payload: IncomingCallEventMap[T]) => void
): void {
  if (!isAndroid) return;

  // Clean up existing listener of the same type before subscribing again
  off(type);

  const subscription = DeviceEventEmitter.addListener(
    EVENT_TYPE_MAP[type],
    handler
  );
  eventHandlers.set(type, subscription);
}

/**
 * Unsubscribes from an incoming call event.
 */
export function off(type: keyof IncomingCallEventMap): void {
  if (!isAndroid) return;

  const subscription = eventHandlers.get(type);
  if (subscription) {
    subscription.remove();
    eventHandlers.delete(type);
  }
}

// --- Unified Configuration & Module Export ---
const IncomingCall = {
  answer,
  backToApp,
  decline,
  dismiss,
  off,
  on,
  show,
} as const;

export default IncomingCall;
