import type { ForegroundOptions } from '../../../IncomingCall.nitro';
import type { IncomingCallNotificationOptions } from '../../../domain/types';

export function mapForegroundOptions(
  options: IncomingCallNotificationOptions
): ForegroundOptions {
  return {
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
  };
}
