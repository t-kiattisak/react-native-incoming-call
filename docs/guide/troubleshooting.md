# Troubleshooting & FAQ

This page addresses common issues, hardware constraints, and platform-specific behaviors when using `react-native-incoming-call`.

---

## 1. Notification Doesn't Open Activity on OEM Devices (Xiaomi, Oppo, Vivo, Huawei)

### The Issue:
On some Android devices (particularly MIUI/HyperOS, ColorOS, FunTouchOS, EMUI), the system aggressively blocks background activities from starting. Instead of launching the full-screen overlay, the phone might only show a standard heads-up notification banner, or nothing at all.

### Solution:
Users must manually grant the "Display pop-up windows while running in the background" permission. 

You can guide your users in the app settings, or programmatically deep-link them to the app settings page:

```typescript
import { Linking, Platform } from 'react-native';

function openAppSettings() {
  if (Platform.OS === 'android') {
    Linking.openSettings();
  }
}
```

---

## 2. Notification Ringtone Sound is Not Playing

### Check list:
1. **Filename spelling**: Ensure `notificationSound` matches the filename in `res/raw/` exactly (case-sensitive) and does **not** include extensions (e.g. use `'ringtone'` instead of `'ringtone.mp3'`).
2. **Channel caching**: Android caches notification channel configurations once created. If you initially registered the notification channel *without* a sound, changing the code won't apply the sound. 
   - **Fix**: Reinstall the app, or change the `channelId` parameter to force Android to create a new notification channel with the new sound settings.

---

## 3. Draw Over Other Apps (System Alert Window)

If you need to show overlay views directly on top of other applications while the device is unlocked, make sure the system alert window permission is granted.

You can check and request the "Draw over other apps" permission using libraries like `react-native-permission-status` or custom native modules if the standard full-screen intent is blocked.

---

## 4. App fails to build in release mode

### The Issue:
ProGuard or R8 shrinker might strip native callbacks and Java/Kotlin hybrid classes, leading to crashes in release builds.

### Solution:
`react-native-incoming-call` is built on top of Nitro Modules, which automatically generates appropriate ProGuard rules. However, you can ensure your main app's proguard file (`android/app/proguard-rules.pro`) keeps the library's classes by adding:

```proguard
-keep class com.margelo.nitro.incomingcall.** { *; }
```
