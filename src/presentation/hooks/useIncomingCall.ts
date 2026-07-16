import { useEffect, useRef, useState, useCallback } from 'react';
import { incomingCall } from '../../infrastructure/IncomingCallBridge';
import type {
  CallAnswerPayload,
  CallDeclinePayload,
  IncomingCallNotificationOptions,
} from '../../domain/types';

export interface UseIncomingCallOptions {
  onAnswer?: (payload: CallAnswerPayload) => void;
  onEndCall?: (payload: CallDeclinePayload) => void;
}

export function useIncomingCall(options?: UseIncomingCallOptions) {
  const [isActive, setIsActive] = useState(false);
  const [callUUID, setCallUUID] = useState<string | null>(null);

  const onAnswerRef = useRef(options?.onAnswer);
  const onEndCallRef = useRef(options?.onEndCall);

  // Sync callbacks to avoid stale closures
  useEffect(() => {
    onAnswerRef.current = options?.onAnswer;
    onEndCallRef.current = options?.onEndCall;
  });

  useEffect(() => {
    const handleAnswer = (payload: CallAnswerPayload) => {
      setIsActive(false);
      setCallUUID(null);
      onAnswerRef.current?.(payload);
    };

    const handleEndCall = (payload: CallDeclinePayload) => {
      setIsActive(false);
      setCallUUID(null);
      onEndCallRef.current?.(payload);
    };

    incomingCall.on('answer', handleAnswer);
    incomingCall.on('endCall', handleEndCall);

    return () => {
      incomingCall.off('answer');
      incomingCall.off('endCall');
    };
  }, []);

  const show = useCallback(
    (
      uuid: string,
      avatar: string | null,
      timeoutMs: number | null,
      showOptions: IncomingCallNotificationOptions
    ) => {
      setCallUUID(uuid);
      setIsActive(true);
      incomingCall.show(uuid, avatar, timeoutMs, showOptions);
    },
    []
  );

  const dismiss = useCallback(() => {
    setIsActive(false);
    setCallUUID(null);
    incomingCall.dismiss();
  }, []);

  const decline = useCallback((uuid: string, payload?: string) => {
    setIsActive(false);
    setCallUUID(null);
    incomingCall.decline(uuid, payload);
  }, []);

  const answer = useCallback((uuid: string, payload?: string) => {
    setIsActive(false);
    setCallUUID(null);
    incomingCall.answer(uuid, payload);
  }, []);

  const backToApp = useCallback(() => {
    incomingCall.backToApp();
  }, []);

  return {
    isActive,
    callUUID,
    show,
    dismiss,
    decline,
    answer,
    backToApp,
  };
}
export type UseIncomingCallResult = ReturnType<typeof useIncomingCall>;
