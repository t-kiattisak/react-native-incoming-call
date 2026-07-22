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
  activeCallUUIDs: string[];
}

type CallAction =
  | { type: 'ADD_CALL'; uuid: string }
  | { type: 'REMOVE_CALL'; uuid: string }
  | { type: 'CLEAR_ALL' };

const initialState: CallState = {
  activeCallUUIDs: [],
};

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'ADD_CALL': {
      if (state.activeCallUUIDs.includes(action.uuid)) {
        return state;
      }
      return {
        activeCallUUIDs: [...state.activeCallUUIDs, action.uuid],
      };
    }
    case 'REMOVE_CALL': {
      const next = state.activeCallUUIDs.filter((id) => id !== action.uuid);
      if (next.length === state.activeCallUUIDs.length) {
        return state;
      }
      return { activeCallUUIDs: next };
    }
    case 'CLEAR_ALL':
      return { activeCallUUIDs: [] };
    default:
      return state;
  }
}

export function useIncomingCall(options?: UseIncomingCallOptions) {
  const [state, dispatch] = useReducer(callReducer, initialState);

  const onAnswerRef = useRef(options?.onAnswer);
  const onEndCallRef = useRef(options?.onEndCall);

  useEffect(() => {
    onAnswerRef.current = options?.onAnswer;
    onEndCallRef.current = options?.onEndCall;
  });

  useEffect(() => {
    const handleAnswer = (payload: CallAnswerPayload) => {
      dispatch({ type: 'REMOVE_CALL', uuid: payload.callUUID });
      onAnswerRef.current?.(payload);
    };

    const handleEndCall = (payload: CallDeclinePayload) => {
      dispatch({ type: 'REMOVE_CALL', uuid: payload.callUUID });
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
      dispatch({ type: 'ADD_CALL', uuid });
      incomingCall.show(uuid, avatar, timeoutMs, showOptions);
    },
    []
  );

  const dismiss = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    incomingCall.dismiss();
  }, []);

  const decline = useCallback((uuid: string, payload?: string) => {
    dispatch({ type: 'REMOVE_CALL', uuid });
    incomingCall.decline(uuid, payload);
  }, []);

  const answer = useCallback((uuid: string, payload?: string) => {
    dispatch({ type: 'REMOVE_CALL', uuid });
    incomingCall.answer(uuid, payload);
  }, []);

  const backToApp = useCallback(() => {
    incomingCall.backToApp();
  }, []);

  const activeCallUUIDs = state.activeCallUUIDs;
  const callUUID =
    activeCallUUIDs.length > 0
      ? activeCallUUIDs[activeCallUUIDs.length - 1] ?? null
      : null;

  return {
    isActive: activeCallUUIDs.length > 0,
    callUUID,
    activeCallCount: activeCallUUIDs.length,
    activeCallUUIDs,
    show,
    dismiss,
    decline,
    answer,
    backToApp,
  };
}
export type UseIncomingCallResult = ReturnType<typeof useIncomingCall>;
