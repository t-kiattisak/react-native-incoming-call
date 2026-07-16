import { useEffect, useRef, useReducer, useCallback } from 'react';
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

interface CallState {
  isActive: boolean;
  callUUID: string | null;
}

type CallAction =
  | { type: 'SHOW_CALL'; uuid: string }
  | { type: 'CLEAR_CALL' };

const initialState: CallState = {
  isActive: false,
  callUUID: null,
};

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'SHOW_CALL':
      return {
        isActive: true,
        callUUID: action.uuid,
      };
    case 'CLEAR_CALL':
      return {
        isActive: false,
        callUUID: null,
      };
    default:
      return state;
  }
}

export function useIncomingCall(options?: UseIncomingCallOptions) {
  const [state, dispatch] = useReducer(callReducer, initialState);

  const onAnswerRef = useRef(options?.onAnswer);
  const onEndCallRef = useRef(options?.onEndCall);

  // Sync callbacks to avoid stale closures
  useEffect(() => {
    onAnswerRef.current = options?.onAnswer;
    onEndCallRef.current = options?.onEndCall;
  });

  useEffect(() => {
    const handleAnswer = (payload: CallAnswerPayload) => {
      dispatch({ type: 'CLEAR_CALL' });
      onAnswerRef.current?.(payload);
    };

    const handleEndCall = (payload: CallDeclinePayload) => {
      dispatch({ type: 'CLEAR_CALL' });
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
      dispatch({ type: 'SHOW_CALL', uuid });
      incomingCall.show(uuid, avatar, timeoutMs, showOptions);
    },
    []
  );

  const dismiss = useCallback(() => {
    dispatch({ type: 'CLEAR_CALL' });
    incomingCall.dismiss();
  }, []);

  const decline = useCallback((uuid: string, payload?: string) => {
    dispatch({ type: 'CLEAR_CALL' });
    incomingCall.decline(uuid, payload);
  }, []);

  const answer = useCallback((uuid: string, payload?: string) => {
    dispatch({ type: 'CLEAR_CALL' });
    incomingCall.answer(uuid, payload);
  }, []);

  const backToApp = useCallback(() => {
    incomingCall.backToApp();
  }, []);

  return {
    isActive: state.isActive,
    callUUID: state.callUUID,
    show,
    dismiss,
    decline,
    answer,
    backToApp,
  };
}
export type UseIncomingCallResult = ReturnType<typeof useIncomingCall>;

