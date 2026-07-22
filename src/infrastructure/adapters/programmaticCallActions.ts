import { DeviceEventEmitter } from 'react-native';
import type { CallAnswerPayload, CallDeclinePayload } from '../../domain/types';
import { NativeIncomingCallEvents } from './constants/nativeEvents';

export function emitProgrammaticAnswer(payload: CallAnswerPayload): void {
  DeviceEventEmitter.emit(NativeIncomingCallEvents.AnswerAction, payload);
}

export function emitProgrammaticDecline(payload: CallDeclinePayload): void {
  DeviceEventEmitter.emit(NativeIncomingCallEvents.EndCallAction, payload);
}
