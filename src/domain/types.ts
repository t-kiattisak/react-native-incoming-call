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

export interface IncomingCallEventMap {
  answer: CallAnswerPayload;
  endCall: CallDeclinePayload;
}

export interface VoipTokenPayload {
  token: string;
}
