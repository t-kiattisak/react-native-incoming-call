# Changelog

## [0.1.1](https://github.com-personal/t-kiattisak/react-native-incoming-call/compare/v0.1.0...v0.1.1) (2026-07-17)


### Features

* **domain:** define types and incoming call bridge interfaces ([5486d86](https://github.com-personal/t-kiattisak/react-native-incoming-call/commit/5486d86122593c4ef1518023af820cbd93e54613))
* **hooks:** implement useIncomingCall and useIncomingCallListener hooks ([51c0962](https://github.com-personal/t-kiattisak/react-native-incoming-call/commit/51c0962ef12e2a0aebda35a4dfce74db528a8a27))
* **infrastructure:** implement native incoming call bridge adapter ([489f90a](https://github.com-personal/t-kiattisak/react-native-incoming-call/commit/489f90af96bc1ef88deeb2a00adcc67af30ffc51))

All notable changes to this project will be documented in this file.

## 0.1.0 (2026-07-14)

### Features
* request POST_NOTIFICATIONS permission at startup on Android 13+ ([ccee235](https://github.com/t-kiattisak/react-native-incoming-call/commit/ccee235))
* implement interactive test example app and fix Kotlin spec signature ([5c8930f](https://github.com/t-kiattisak/react-native-incoming-call/commit/5c8930f))
* implement Android Kotlin/Java logic and iOS Swift stubs ([4813608](https://github.com/t-kiattisak/react-native-incoming-call/commit/4813608))
* add Android layouts, drawable resources, and assets ([bab61db](https://github.com/t-kiattisak/react-native-incoming-call/commit/bab61db))
* update TypeScript spec and JS wrapper API ([28786ae](https://github.com/t-kiattisak/react-native-incoming-call/commit/28786ae))

### Bug Fixes
* update avatar parameter type to Variant_NullType_String in IncomingCall.displayNotification ([24afa4d](https://github.com/t-kiattisak/react-native-incoming-call/commit/24afa4d))
* dynamically resolve ReactContext via reflection to prevent null context on JSI only initialization ([b32460a](https://github.com/t-kiattisak/react-native-incoming-call/commit/b32460a))

### Documentation
* initialize documentation site with VitePress and add core implementation guides ([afd7f01](https://github.com/t-kiattisak/react-native-incoming-call/commit/afd7f01))
* overhaul README with comprehensive installation, configuration, and API usage documentation ([5ec0fd3](https://github.com/t-kiattisak/react-native-incoming-call/commit/5ec0fd3))

### Chores
* add MANAGE_OWN_CALLS permission in manifests to support phoneCall FGS on Android 14+ ([b69e08d](https://github.com/t-kiattisak/react-native-incoming-call/commit/b69e08d))
* declare POST_NOTIFICATIONS permission in manifests ([2486511](https://github.com/t-kiattisak/react-native-incoming-call/commit/2486511))
