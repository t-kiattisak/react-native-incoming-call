# react-native-incoming-call 📞

A high-performance React Native library for displaying full-screen incoming call notifications on Android, powered by **[Nitro Modules](https://nitro.margelo.com/)** for fast, synchronous Native-JS communication.

---

## Features

- **Full-Screen Incoming Call Overlay**: Displays on top of the lock screen and other applications.
- **Nitro Modules**: Fast and direct Native-to-JS interface.
- **Highly Configurable**: Custom avatar, title, body, sound, actions text, and custom payloads.
- **Custom React Native Components**: Render your own React Native view within the native incoming call activity using `mainComponent`.
- **Event Callbacks**: Simple event listeners for call answered, declined, or timed out.

---

## Installation

```sh
npm install react-native-incoming-call react-native-nitro-modules
# or using yarn
yarn add react-native-incoming-call react-native-nitro-modules
# or using pnpm
pnpm add react-native-incoming-call react-native-nitro-modules
```

> [!IMPORTANT]
> `react-native-nitro-modules` is required as this library is built on top of [Nitro Modules](https://nitro.margelo.com/).

---

## Android Configuration

Ensure your app requests the necessary notification permissions at runtime (especially on Android 13+). You can request `POST_NOTIFICATIONS` permission like this:

```typescript
import { Platform, PermissionsAndroid } from 'react-native';

async function checkAndRequestPermissions() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (!hasPermission) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
  }
}
```

---

## Usage

Here is a complete usage example showing how to initialize listeners, trigger notifications, and respond to call events:

```typescript
import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import IncomingCall, { show, dismiss, on, off, backToApp } from 'react-native-incoming-call';

export default function App() {
  useEffect(() => {
    // 1. Subscribe to events
    on('answer', (payload) => {
      console.log('Call Answered! UUID:', payload.callUUID);
      Alert.alert('Call Answered', `UUID: ${payload.callUUID}`);
      
      // Bring app to foreground if needed
      backToApp();
    });

    on('endCall', (payload) => {
      console.log(`Call Ended/Declined (Action: ${payload.endAction})`);
      Alert.alert('Call Declined', `UUID: ${payload.callUUID}\nAction: ${payload.endAction}`);
    });

    return () => {
      // 2. Clean up listeners on unmount
      off('answer');
      off('endCall');
    };
  }, []);

  const triggerCall = () => {
    const callUUID = '123e4567-e89b-12d3-a456-426614174000';
    
    show(
      callUUID,
      'https://i.pravatar.cc/300', // Avatar URL (nullable)
      15000,                      // Timeout (ms) (nullable)
      {
        channelId: 'incoming_call_channel',
        channelName: 'Incoming Calls',
        notificationIcon: 'ic_launcher', // Fallback to app icon resource
        notificationTitle: 'Kiattisak Jomram',
        notificationBody: 'Incoming video call...',
        answerText: 'Accept Call',
        declineText: 'Decline',
        isVideo: true,
        notificationColor: 'colorAccent', // Resource name in colors.xml
        payload: {
          callerId: 'user_kiattisak_123',
          chatRoom: 'room_call_abc',
        },
      }
    );
  };

  const manualDismiss = () => {
    dismiss();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Trigger Call Overlay" onPress={triggerCall} />
      <Button title="Dismiss Notification" onPress={manualDismiss} />
    </View>
  );
}
```

---

## API Reference

### Methods

#### `show(uuid, avatar, timeoutMs, options)`
Displays the full-screen incoming call overlay (Android only).
- **`uuid`** (`string`): Unique identifier for the call.
- **`avatar`** (`string | null`): Image URL of the caller's avatar.
- **`timeoutMs`** (`number | null`): Timeout in milliseconds after which the call is auto-dismissed.
- **`options`** (`IncomingCallNotificationOptions`): Configuration options for the notification.

#### `dismiss()`
Manually dismisses the incoming call notification.

#### `backToApp()`
Brings the host application back to the foreground (highly useful after answering).

#### `answer(uuid, payload?)`
Simulates call acceptance programmatically, triggering the `'answer'` event and dismissing the notification.

#### `decline(uuid, payload?)`
Simulates call decline programmatically, triggering the `'endCall'` event and dismissing the notification.

#### `on(event, handler)`
Subscribes to native events:
- **`'answer'`**: Fired when the call is accepted.
- **`'endCall'`**: Fired when the call is declined, times out, or is manually dismissed.

#### `off(event)`
Unsubscribes from events.

---

## Custom React Native UI (`mainComponent`)

You can fully customize the incoming call screen by registering a custom React Native component and passing its name in the `options.mainComponent` property.

1. **Register the component in your root index file:**
   ```typescript
   import { AppRegistry } from 'react-native';
   import CustomCallScreen from './CustomCallScreen';

   AppRegistry.registerComponent('CustomCallScreen', () => CustomCallScreen);
   ```

2. **Pass the registered component name to `show`:**
   ```typescript
   show(uuid, avatar, timeoutMs, {
     // ... other options
     mainComponent: 'CustomCallScreen',
   });
   ```

3. **Get properties in your custom screen:**
   The component will receive the initialization properties (like `uuid`, `notificationTitle`, `payload`, etc.) as direct props.

---

## Types

```typescript
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
```

---

## Contributing

Please see the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details on how to get started.

## License

MIT
