# Getting Started

`react-native-incoming-call` is a high-performance React Native library designed to display full-screen incoming call notifications on Android. It is powered by **Nitro Modules** for fast, synchronous Native-JS communication.

---

## Installation

Install the library along with its peer dependency `react-native-nitro-modules`:

::: code-group

```sh [npm]
npm install react-native-incoming-call react-native-nitro-modules
```

```sh [yarn]
yarn add react-native-incoming-call react-native-nitro-modules
```

```sh [pnpm]
pnpm add react-native-incoming-call react-native-nitro-modules
```

:::

> [!IMPORTANT]
> `react-native-nitro-modules` is required because this library leverages Nitro Modules for extremely fast native communication.

---

## Android Configuration

The library comes pre-packaged with all the necessary Android manifest declarations (permissions, activities, and services). However, starting from Android 13 (API level 33), applications must request notification permissions at runtime.

Add permission requesting logic in your root component:

```typescript
import { Platform, PermissionsAndroid } from 'react-native';

async function checkAndRequestPermissions() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (!hasPermission) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    }
  }
}
```

---

## Basic Usage

Here is a quick example of how to import the module, configure event listeners, and trigger the incoming call UI:

```typescript
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import IncomingCall, { show, dismiss, on, off } from 'react-native-incoming-call';

export default function App() {
  useEffect(() => {
    // 1. Subscribe to events
    on('answer', (payload) => {
      console.log('Call Answered! UUID:', payload.callUUID);
      // Bring your app to foreground, navigate to call screen, etc.
    });

    on('endCall', (payload) => {
      console.log('Call Ended/Declined. Action:', payload.endAction);
    });

    return () => {
      // 2. Unsubscribe on cleanup
      off('answer');
      off('endCall');
    };
  }, []);

  const triggerCall = () => {
    const callUUID = 'unique-uuid-12345';
    
    show(
      callUUID,
      'https://i.pravatar.cc/300', // Avatar Image URL (can be null)
      15000,                      // Timeout in ms (15 seconds, can be null)
      {
        channelId: 'incoming_call_channel',
        channelName: 'Incoming Calls',
        notificationIcon: 'ic_launcher',
        notificationTitle: 'Kiattisak Jomram',
        notificationBody: 'Incoming video call...',
        answerText: 'Accept Call',
        declineText: 'Decline',
        isVideo: true,
        notificationColor: 'colorAccent',
        payload: {
          callerId: 'user_123',
          chatRoom: 'room_abc',
        },
      }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Trigger Call Overlay" onPress={triggerCall} />
    </View>
  );
}
```
