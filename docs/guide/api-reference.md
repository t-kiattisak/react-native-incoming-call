# API Reference

This page describes all the exported methods, options, and types for `react-native-incoming-call`.

---

## Internal architecture (TypeScript)

The public API is implemented as a thin **facade** ([`IncomingCallBridge`](https://github.com/t-kiattisak/react-native-incoming-call/blob/main/src/infrastructure/IncomingCallBridge.ts)) over:

- **`IIncomingCallNativeAdapter`** — Nitro hybrid calls (`show`, `dismiss`, VoIP registration), with per-OS adapters under `src/infrastructure/adapters/`
- **`IIncomingCallEventAdapter`** — `DeviceEventEmitter` subscriptions for answer/end/voip token events

Native Swift/Kotlin code is unchanged; adapters exist only on the JS side for testability and separation of concerns.

---

## Platform support

| Method / event | Android | iOS |
| --- | --- | --- |
| `show()` | Full-screen overlay | CallKit incoming UI |
| `dismiss()` | Yes | Ends active CallKit incoming call |
| `backToApp()` | Yes | Opens app URL scheme |
| `on('answer')` / `on('endCall')` | Yes | Yes |
| `registerVoipPush()` | No-op | PushKit VoIP registration |
| `onVoipToken()` | N/A (no event) | VoIP device token |

On iOS, `uuid` must be a **RFC4122 UUID**. See [iOS CallKit & PushKit](./ios-callkit-pushkit.md).

---

## Methods

### `show()`

Displays the incoming call UI.

- **Android:** full-screen overlay / notification flow.
- **iOS:** reports an incoming call to CallKit.

```typescript
function show(
  uuid: string,
  avatar: string | null,
  timeoutMs: number | null,
  options: IncomingCallNotificationOptions
): void;
```

#### Parameters:
- **`uuid`** (`string`): Unique call id (RFC4122 UUID on iOS).
- **`avatar`** (`string | null`): Caller avatar URL (Android UI). Not fetched by native code on iOS (v1).
- **`timeoutMs`** (`number | null`): Auto-dismiss in milliseconds. `null` or `0` disables timeout.
- **`options`** (`IncomingCallNotificationOptions`): Call metadata and Android notification settings.

---

### `dismiss()`

Dismisses/hides the active incoming call immediately.

```typescript
function dismiss(): void;
```

---

### `backToApp()`

Brings the application back into the foreground. Typically called right after answering the call.

```typescript
function backToApp(): void;
```

---

### `answer()`

Programmatically answers the call. This dismisses the active notification and fires the `'answer'` event listener.

```typescript
function answer(uuid: string, payload?: string): void;
```

---

### `decline()`

Programmatically declines the call. This dismisses the active notification and fires the `'endCall'` event listener.

```typescript
function decline(uuid: string, payload?: string): void;
```

---

### `registerVoipPush()` / `unregisterVoipPush()`

**iOS only.** Registers or tears down PushKit for VoIP pushes. Android methods are no-ops.

```typescript
function registerVoipPush(): void;
function unregisterVoipPush(): void;
```

---

### `on()` / `off()`

Subscribes to native incoming call events.

```typescript
function on(
  event: 'answer' | 'endCall',
  handler: (payload: any) => void
): void;

function off(event: 'answer' | 'endCall'): void;
```

- **`'answer'`**: User accepted the call. Receives `CallAnswerPayload`.
- **`'endCall'`**: Declined, timed out, or dismissed. Receives `CallDeclinePayload`.

---

### `onVoipToken()` / `offVoipToken()`

**iOS only.** Listens for the VoIP device token after `registerVoipPush()`.

```typescript
function onVoipToken(handler: (payload: VoipTokenPayload) => void): void;
function offVoipToken(): void;
```

---

## Interfaces & Types

### `IncomingCallNotificationOptions`

Configuration dictionary passed to `show()`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `channelId` | `string` | Notification Channel ID (Android). |
| `channelName` | `string` | Notification Channel name (Android). |
| `notificationIcon` | `string` | Drawable resource name (Android). |
| `notificationTitle` | `string` | Caller name / CallKit localized name (iOS). |
| `notificationBody` | `string \| null` | Subtitle (Android); stored in session on iOS. |
| `answerText` | `string` | Accept button label (Android). |
| `declineText` | `string` | Decline button label (Android). |
| `notificationColor` | `string` | Accent color resource (Android, optional). |
| `notificationSound` | `string` | Custom sound resource (Android, optional). |
| `mainComponent` | `string` | Custom RN component in call activity (Android, optional). |
| `isVideo` | `boolean` | Video call indicator (optional). |
| `payload` | `Record<string, string>` | Custom data passed through events (optional). |

### `CallAnswerPayload`

Payload returned by the `'answer'` listener.

```typescript
export interface CallAnswerPayload {
  callUUID: string;
  payload?: string; // JSON string of the options payload
}
```

### `CallDeclinePayload`

Payload returned by the `'endCall'` listener.

```typescript
export interface CallDeclinePayload {
  callUUID: string;
  payload?: string; // JSON string of the options payload
  endAction: 'ACTION_REJECTED_CALL' | 'ACTION_HIDE_CALL';
}
```

### `VoipTokenPayload`

Payload for `onVoipToken()` (iOS).

```typescript
export interface VoipTokenPayload {
  token: string;
}
```
