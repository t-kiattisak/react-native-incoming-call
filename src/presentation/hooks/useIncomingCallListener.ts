import { useEffect, useRef } from 'react';
import { incomingCall } from '../../infrastructure/IncomingCallBridge';
import type { IncomingCallEventMap } from '../../domain/types';

export function useIncomingCallListener<T extends keyof IncomingCallEventMap>(
  type: T,
  handler: (payload: IncomingCallEventMap[T]) => void
): void {
  const handlerRef = useRef(handler);

  // Sync handler callback to ref to avoid stale closures
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const eventHandler = (payload: IncomingCallEventMap[T]) => {
      handlerRef.current(payload);
    };

    incomingCall.on(type, eventHandler);

    return () => {
      incomingCall.off(type);
    };
  }, [type]);
}
