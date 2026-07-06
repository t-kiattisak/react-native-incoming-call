import { NitroModules } from 'react-native-nitro-modules';
import type { IncomingCall } from './IncomingCall.nitro';

const IncomingCallHybridObject =
  NitroModules.createHybridObject<IncomingCall>('IncomingCall');

export function multiply(a: number, b: number): number {
  return IncomingCallHybridObject.multiply(a, b);
}
