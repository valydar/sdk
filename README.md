# Valydar SDKs

Official SDKs for the Valydar identity verification platform.

## Packages

| Platform | Package | Source |
|----------|---------|--------|
| Web (JS) | `@valydar/web-sdk` | `sdk/valydar.js` |
| React Native | `@valydar/react-native` | `sdk/react-native/` |
| WASM | `@valydar/wasm` | `crates/valydar-wasm/pkg/` |
| Python | `valydar` | `sdk/python/` |
| C# (.NET) | `Valydar` | `sdk/csharp/Valydar/` |
| Java | `com.valydar:valydar` | `sdk/java/` |
| Flutter | `valydar` | `sdk/flutter/` |
| iOS (Swift) | `valydar` | `sdk/ios/` |
| Android (Kotlin) | `com.valydar:valydar` | `sdk/android/` |

## Publishing

SDKs are published via GitHub Actions when a tag matching `sdk-v*` is pushed:

```bash
git tag sdk-v0.1.0
git push origin sdk-v0.1.0
```

Or manually via `workflow_dispatch` in the Actions tab.
