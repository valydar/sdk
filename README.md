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

### Registries

| SDK | Registry | Workflow | Required secrets |
|-----|----------|----------|------------------|
| Web (JS) | npm | `publish-js.yml` | `NPM_TOKEN` |
| Python | PyPI | `publish-python.yml` | trusted publishing (none) |
| C# (.NET) | NuGet | `publish-csharp.yml` | `NUGET_API_KEY` |
| Java | Maven Central | `publish-java.yml` | `OSSRH_USERNAME`, `OSSRH_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` |

Version is derived from the tag (`sdk-v0.1.0` → `0.1.0`). Add the secrets in
Settings → Secrets and variables → Actions before tagging.

## Server-side SDKs

The Python, C#, and Java SDKs are designed for **backend usage** (B2B API-key auth)
and cover the full API surface: documents, selfies, face match, document/selfie
liveness, deepfake detection, NFC ePassport verification, active liveness
(challenge-response), and the public no-auth demo verification.
