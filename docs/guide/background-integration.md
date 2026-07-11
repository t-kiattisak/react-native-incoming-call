# Background Integration

In real-world applications, incoming calls are typically triggered via remote VoIP notifications or push messages when the app is in the background or completely closed (killed).

This guide explains how to integrate `react-native-incoming-call` with **Firebase Cloud Messaging (FCM)** to display full-screen overlay notifications in the background.

---

## 1. Setup Firebase Cloud Messaging (FCM)

Ensure you have `@react-native-firebase/app` and `@react-native-firebase/messaging` installed and configured in your React Native project.

---

## 2. Register Background Message Handler

Register a background message handler in your app's entry point (e.g., `index.js` or `App.tsx` at the root). 

::: warning
The background handler must be registered outside of any React component lifecycle (like `useEffect`) and should be a top-level function.
:::

Create and configure `index.js`:

```typescript
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import IncomingCall, { show } from 'react-native-incoming-call';
import App from './App';

// 1. Define the background message handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Received background message:', remoteMessage);

  // Check if this payload represents an incoming call
  if (remoteMessage.data && remoteMessage.data.type === 'incoming_call') {
    const { uuid, title, body, avatar, timeout, channelId, channelName } = remoteMessage.data;

    // Trigger the full-screen call overlay
    show(
      uuid,
      avatar || null,
      timeout ? parseInt(timeout, 10) : 15000,
      {
        channelId: channelId || 'call_channel',
        channelName: channelName || 'Incoming Calls',
        notificationIcon: 'ic_launcher',
        notificationTitle: title || 'Incoming Call',
        notificationBody: body || 'Someone is calling...',
        answerText: 'Accept',
        declineText: 'Decline',
        isVideo: true,
        payload: {
          chatRoomId: remoteMessage.data.chatRoomId,
        }
      }
    );
  }
});

AppRegistry.registerComponent('main', () => App);
```

---

## 3. Server-side Push Notification Payload

To trigger the background handler correctly, the backend must send a **Data-only message** (without a `notification` block). If the push contains a `notification` block, the OS will display a default system tray notification instead of triggering the background JS handler.

### Example JSON Payload (FCM v1 API)

```json
{
  "message": {
    "token": "USER_FCM_DEVICE_TOKEN",
    "data": {
      "type": "incoming_call",
      "uuid": "4f9d8a3b-2856-42d7-a579-245c1a8e7e00",
      "title": "Jane Doe",
      "body": "Incoming high-quality video call...",
      "avatar": "https://example.com/avatar.jpg",
      "timeout": "20000",
      "chatRoomId": "room_xyz_123"
    }
  }
}
```

---

## 4. Handle Foreground Events

When the user taps **Accept / Answer** from the overlay, your app will trigger the `answer` event listener. 

Ensure you have a listener initialized in the root of your application to catch this event and route the user to the active call screen:

```typescript
import React, { useEffect } from 'react';
import { on, off, backToApp } from 'react-native-incoming-call';

export default function App() {
  useEffect(() => {
    // Listen to call acceptance
    on('answer', (payload) => {
      console.log('User accepted call with UUID:', payload.callUUID);
      
      // 1. Bring application back to foreground
      backToApp();

      // 2. Navigate user to call screen (e.g. using React Navigation)
      // navigation.navigate('CallScreen', { uuid: payload.callUUID });
    });

    on('endCall', (payload) => {
      console.log('Call ended/timed out. Action:', payload.endAction);
    });

    return () => {
      off('answer');
      off('endCall');
    };
  }, []);

  return (
    // Your React Navigation container
    null
  );
}
```
