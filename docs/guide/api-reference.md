# API Reference

This page describes all the exported methods, options, and types for `react-native-incoming-call`.

---

## Methods

### `show()`

Displays the full-screen incoming call overlay (Android only).

```typescript
function show(
  uuid: string,
  avatar: string | null,
  timeoutMs: number | null,
  options: IncomingCallNotificationOptions
): void;
```

#### Parameters:
- **`uuid`** (`string`): A unique string identifying the call session.
- **`avatar`** (`string | null`): HTTP URL of the caller's avatar. Passes `null` to use the default icon.
- **`timeoutMs`** (`number | null`): Automatic timeout duration in milliseconds. Pass `null` or `0` to disable auto-timeout.
- **`options`** (`IncomingCallNotificationOptions`): Layout and metadata settings for the notification overlay.

---

### `dismiss()`

Dismisses/hides the active incoming call notification immediately.

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

### `on()`

Subscribes to native incoming call events.

```typescript
function on(
  event: 'answer' | 'endCall',
  handler: (payload: any) => void
): void;
```

- **`'answer'`**: Triggered when the user taps the answer button. Receives `CallAnswerPayload`.
- **`'endCall'`**: Triggered when the user declines the call, when the notification times out, or when dismissed. Receives `CallDeclinePayload`.

---

### `off()`

Unsubscribes a listener from an event.

```typescript
function off(event: 'answer' | 'endCall'): void;
```

---

## Interfaces & Types

### `IncomingCallNotificationOptions`

Configuration dictionary passed to `show()`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `channelId` | `string` | Notification Channel ID. |
| `channelName` | `string` | Display name of the Notification Channel. |
| `notificationIcon` | `string` | Drawable resource name for the notification icon (e.g. `'ic_launcher'`). |
| `notificationTitle` | `string` | Text header of the incoming call. |
| `notificationBody` | `string \| null` | Sub-header description text (optional). |
| `answerText` | `string` | Label for the Accept/Answer button. |
| `declineText` | `string` | Label for the Decline/Reject button. |
| `notificationColor` | `string` | XML accent color resource name (optional). |
| `notificationSound` | `string` | Custom raw sound resource file name (optional). |
| `mainComponent` | `string` | React AppRegistry component name to render as custom screen UI (optional). |
| `isVideo` | `boolean` | Flag to display video call icon indicator (optional). |
| `payload` | `Record<string, string>` | Custom key-value pairs passed through intents/events (optional). |

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
