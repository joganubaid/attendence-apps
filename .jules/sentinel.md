## 2024-02-14 - URL Validation for External Links
**Vulnerability:** Unvalidated URLs passed to `WebBrowser.openBrowserAsync` or `Linking.openURL` can lead to XSS (via `javascript:` scheme) or unintended file access (via `file:` scheme).
**Learning:** `WebBrowser.openBrowserAsync` generally handles web protocols, but explicit validation at the application level adds a necessary layer of defense, especially when dealing with data that could be user-generated or externally sourced (like chatbot flows).
**Prevention:** Use a centralized `isSafeUrl` helper to strictly allow only `http://` and `https://` schemes before opening any external link.
