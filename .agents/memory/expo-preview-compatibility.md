---
name: Expo preview compatibility
description: Cross-platform Expo preview constraints discovered while building FormReady.
---

Keep web-safe module initialization in Expo screens. Heavy or platform-sensitive libraries such as PDF parsers should not initialize at module scope when the same route is rendered by Expo web.

**Why:** The web preview crashed before rendering when a PDF parser was imported at the top of a screen, even though the PDF action was never opened. Lazy-loading that capability kept the app bootable.

**How to apply:** Prefer Expo-compatible native modules and lazy-load optional document-processing libraries inside the user action that needs them. Treat missing React Native DevTools shared libraries as preview-environment noise when Metro itself is healthy.