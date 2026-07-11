# Assets & Customization

To make the incoming call overlay match your application's branding, you can customize the notification icon, accent colors, and incoming call ringtone.

This guide explains how to bundle and reference these static resources on Android.

---

## 1. Custom Ringtone Sound

By default, the library uses the system's default notification or ringtone sound. To play a custom ringtone when a call comes in:

1. **Add Sound File**: Place your sound file (e.g. `my_ringtone.mp3` or `my_ringtone.wav`) into your project's Android resource folder:
   ```
   android/app/src/main/res/raw/my_ringtone.mp3
   ```
   *(Create the `raw` directory if it does not exist).*

2. **Reference the Sound**: Pass the filename **without the file extension** to the `notificationSound` property in `show()` options:
   ```typescript
   show(uuid, avatar, timeout, {
     // ... other options
     notificationSound: 'my_ringtone', // refers to raw/my_ringtone.mp3
   });
   ```

---

## 2. Custom Notification Icon

To display your own logo or call icon inside the notification bar status and overlay:

1. **Add Icon Resources**: Generate and copy your icon files into your Android resource mipmap/drawable directories:
   ```
   android/app/src/main/res/mipmap-hdpi/ic_call_custom.png
   android/app/src/main/res/mipmap-xhdpi/ic_call_custom.png
   android/app/src/main/res/mipmap-xxhdpi/ic_call_custom.png
   android/app/src/main/res/mipmap-xxxhdpi/ic_call_custom.png
   ```

2. **Reference the Icon**: Pass the icon resource name (without folder name or extension) to `notificationIcon`:
   ```typescript
   show(uuid, avatar, timeout, {
     // ... other options
     notificationIcon: 'ic_call_custom',
   });
   ```

---

## 3. Accent Color Customization

The overlay can show customizable background colors on action buttons or headings.

1. **Define Colors**: In your Android app's color resources file (`android/app/src/main/res/values/colors.xml`), add your custom branding colors:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <color name="callBrandColor">#6A1B9A</color>
       <color name="callAccentColor">#8A4FFF</color>
   </resources>
   ```

2. **Reference the Color**: Pass the color name to `notificationColor`:
   ```typescript
   show(uuid, avatar, timeout, {
     // ... other options
     notificationColor: 'callBrandColor', // references colors.xml color name
   });
   ```
