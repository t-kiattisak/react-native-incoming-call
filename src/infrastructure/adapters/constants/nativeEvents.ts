export const NativeIncomingCallEvents = {
  AnswerAction: 'RNNotificationAnswerAction',
  EndCallAction: 'RNNotificationEndCallAction',
  VoipToken: 'RNIncomingCallVoipToken',
} as const;

export const INCOMING_CALL_EVENT_TYPE_MAP = {
  answer: NativeIncomingCallEvents.AnswerAction,
  endCall: NativeIncomingCallEvents.EndCallAction,
} as const;
