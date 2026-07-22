# Changelog

## [0.2.1-beta.0](https://github.com/t-kiattisak/react-native-incoming-call/compare/v0.1.1...v0.2.1-beta.0) (2026-07-22)


### Bug Fixes

* add completion handling for CallKit reports and optimize Android foreground service startup and notification updates ([782a4ad](https://github.com/t-kiattisak/react-native-incoming-call/commit/782a4ad51cae265e9a79cb8a1a4bf8fc05d05962))


### Features

* add GitHub Actions workflow for automated releases ([17026c9](https://github.com/t-kiattisak/react-native-incoming-call/commit/17026c9b98a810c1f42f49079ce7015d38b8539d))
* **example:** VoIP registration and multi-call hook demo ([8c90f5f](https://github.com/t-kiattisak/react-native-incoming-call/commit/8c90f5f42d1a5e7836af25f98015c7425e94fbbf))
* **expo:** config plugin for VoIP and audio background modes ([e315afa](https://github.com/t-kiattisak/react-native-incoming-call/commit/e315afa066cdc030072e901124fcc53ebd27a8ea))
* **ios:** add CallKit, PushKit, and VoIP Nitro API ([2955138](https://github.com/t-kiattisak/react-native-incoming-call/commit/295513886d85b3dbae370f30c68689e327e3feb0))

# [0.2.0](https://github.com/t-kiattisak/react-native-incoming-call/compare/v0.1.1...v0.2.0) (2026-07-22)

### Bug Fixes

* add completion handling for CallKit reports and optimize Android foreground service startup and notification updates ([782a4ad](https://github.com/t-kiattisak/react-native-incoming-call/commit/782a4ad51cae265e9a79cb8a1a4bf8fc05d05962))

### Features

* add GitHub Actions workflow for automated releases ([17026c9](https://github.com/t-kiattisak/react-native-incoming-call/commit/17026c9b98a810c1f42f49079ce7015d38b8539d))
* **example:** VoIP registration and multi-call hook demo ([8c90f5f](https://github.com/t-kiattisak/react-native-incoming-call/commit/8c90f5f42d1a5e7836af25f98015c7425e94fbbf))
* **expo:** config plugin for VoIP and audio background modes ([e315afa](https://github.com/t-kiattisak/react-native-incoming-call/commit/e315afa066cdc030072e901124fcc53ebd27a8ea))
* **ios:** add CallKit, PushKit, and VoIP Nitro API ([2955138](https://github.com/t-kiattisak/react-native-incoming-call/commit/295513886d85b3dbae370f30c68689e327e3feb0))

## [0.1.1](https://github.com/t-kiattisak/react-native-incoming-call/compare/v0.1.0...v0.1.1) (2026-07-17)


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
