# iOS CallKit & PushKit

On iOS, incoming calls use **CallKit** (system call UI) instead of the Android full-screen overlay. Background and killed-state calls rely on **PushKit VoIP pushes** from APNs.

---

## Requirements

- Physical iOS device (CallKit / VoIP push are unreliable on Simulator)
- Apple Developer account with **Push Notifications** and VoIP capability
- APNs **VoIP Services** key or certificate configured on your backend
- Expo: add the library config plugin (see below) or set `UIBackgroundModes` manually

---

## Expo config plugin

In `app.json`:

```json
{
  "expo": {
    "plugins": ["rn-incoming-call-nitro"]
  }
}
```

This adds `voip` and `audio` to `UIBackgroundModes`.

After changing plugins, run `npx expo prebuild --clean` for native projects.

---

## Register for VoIP push

```typescript
import { registerVoipPush, onVoipToken, offVoipToken } from 'rn-incoming-call-nitro';

useEffect(() => {
  onVoipToken(({ token }) => {
    // Send token to your backend over HTTPS only — treat as a secret.
  });
  registerVoipPush();

  return () => offVoipToken();
}, []);
```

---

## Foreground / JS-triggered calls

The same `show()` API works on iOS. Use a **RFC4122 UUID** (e.g. `crypto.randomUUID()`).

```typescript
show(crypto.randomUUID(), null, 15000, {
  channelId: 'unused-on-ios',
  channelName: 'Unused on iOS',
  notificationIcon: 'unused',
  notificationTitle: 'Jane Doe',
  notificationBody: 'Incoming call',
  answerText: 'Accept',
  declineText: 'Decline',
  isVideo: true,
});
```

CallKit uses system Answer/Decline labels; `answerText` / `declineText` are ignored on iOS.

Listen for events with `on('answer')` and `on('endCall')` — same event names as Android.

---

## VoIP push payload (APNs)

Align with the Android FCM data shape where possible. The native layer validates:

| Field | Required | Notes |
|--------|----------|--------|
| `type` | Yes | Must be `incoming_call` |
| `uuid` | Yes | RFC4122 UUID |
| `title` | No | Caller name (max 256 chars, sanitized) |
| `body` | No | Stored in session, not shown on CallKit UI |
| `timeout` | No | Milliseconds until auto-dismiss (`ACTION_HIDE_CALL`) |
| `isVideo` | No | `true` / `false` |
| Other keys | No | Merged into `payload` JSON on answer/end events |

Example APNs payload (custom data):

```json
{
  "type": "incoming_call",
  "uuid": "4f9d8a3b-2856-42d7-a579-245c1a8e7e00",
  "title": "Jane Doe",
  "body": "Incoming video call",
  "timeout": "20000",
  "isVideo": "true",
  "chatRoomId": "room_xyz_123"
}
```

Invalid payloads are **not** reported to CallKit; the PushKit completion handler is still called.

---

## Security checklist

- **VoIP push ≠ proof of a legitimate call.** When the user taps Answer, validate the session with your backend (JWT, call id, TURN credentials) before opening media.
- Send the VoIP device token to your server **only over HTTPS**; never log the full token in production analytics or crash reports.
- Do not use VoIP pushes for generic silent sync — App Review and user trust require real-time calling use cases.

---

## Performance checklist

- Native code does **not** download avatar URLs on the push path.
- Duplicate `uuid` reports while a call is still incoming are ignored.
- Call events are queued (bounded) if the React bridge is not ready yet, then flushed when the bridge loads.

---

## Bare React Native

1. Enable **Background Modes → Voice over IP** (and Audio if you use WebRTC) in Xcode.
2. Call `registerVoipPush()` from JS when your app starts.
3. Ensure the `IncomingCallBridge` native module is linked (CocoaPods autolinking).

No JavaScript runs when a VoIP push wakes a killed app; CallKit is shown from native code immediately.

---

## Platform differences

| Feature | Android | iOS |
|---------|---------|-----|
| UI | Full-screen overlay / notification | System CallKit |
| Background trigger | FCM data message | APNs VoIP (PushKit) |
| Custom answer/decline labels | Yes | No (system UI) |
| `avatar` URL in `show()` | Loaded in UI | Not fetched by native module (v1) |
