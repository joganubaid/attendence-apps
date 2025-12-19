## 2024-03-24 - Unvalidated URL Schemes
**Vulnerability:** `ClassBot.js` passed `action.url` directly to `WebBrowser.openBrowserAsync` without validation. This could allow execution of `javascript:` or `file:` schemes if the flow data was compromised or malicious.
**Learning:** React Native's `WebBrowser` or `Linking` APIs do not automatically sanitize schemes. Always explicitly allowlist protocols (http/https).
**Prevention:** Created `utils/security.js` with `isSafeUrl` to centralize URL validation and applied it to `ClassBot.js` and `flowRepository.js`.
