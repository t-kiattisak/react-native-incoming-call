import { Platform } from 'react-native';
import type { IIncomingCallEventAdapter } from '../../domain/interfaces/IIncomingCallEventAdapter';
import type { IIncomingCallNativeAdapter } from '../../domain/interfaces/IIncomingCallNativeAdapter';
import { AndroidNativeCallAdapter } from './android/AndroidNativeCallAdapter';
import { DeviceEventAdapter } from './events/DeviceEventAdapter';
import { IosNativeCallAdapter } from './ios/IosNativeCallAdapter';
import { NitroHybridClient } from './nitro/NitroHybridClient';
import { NoOpNativeCallAdapter } from './noop/NoOpNativeCallAdapter';

export interface PlatformAdapters {
  native: IIncomingCallNativeAdapter;
  events: IIncomingCallEventAdapter;
}

let sharedEventAdapter: DeviceEventAdapter | null = null;

function getSharedEventAdapter(): DeviceEventAdapter {
  if (!sharedEventAdapter) {
    sharedEventAdapter = new DeviceEventAdapter();
  }
  return sharedEventAdapter;
}

export function createPlatformAdapters(): PlatformAdapters {
  const events = getSharedEventAdapter();

  if (Platform.OS === 'android') {
    return {
      native: new AndroidNativeCallAdapter(NitroHybridClient.create()),
      events,
    };
  }

  if (Platform.OS === 'ios') {
    return {
      native: new IosNativeCallAdapter(NitroHybridClient.create()),
      events,
    };
  }

  return {
    native: new NoOpNativeCallAdapter(),
    events,
  };
}
