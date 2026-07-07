import type { HybridObject } from 'react-native-nitro-modules';

export interface ForegroundOptions {
  channelId: string;
  channelName: string;
  notificationIcon: string;
  notificationTitle: string;
  notificationBody?: string;
  answerText: string;
  declineText: string;
  notificationColor?: string;
  notificationSound?: string;
  mainComponent?: string;
  isVideo?: boolean;
  payload?: Record<string, string>;
}

export interface IncomingCall extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  displayNotification(
    uuid: string,
    avatar: string | null,
    timeout: number,
    foregroundOptions: ForegroundOptions
  ): void;
  hideNotification(): void;
  backToApp(): void;
}
