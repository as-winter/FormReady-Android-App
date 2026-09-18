---
name: Standalone Expo builds
description: Monorepo isolation rules for reliable Expo/EAS dependency installation.
---

An Expo app that must build independently from a pnpm monorepo needs its own workspace boundary and lockfile. Avoid `workspace:` and `catalog:` dependency specs in that standalone boundary, and explicitly allow required native-package build scripts such as esbuild.

**Why:** EAS dependency installation can otherwise resolve the monorepo root, pulling in unrelated services and their native build dependencies. That makes an app build fail before Expo configuration or native compilation begins.

**How to apply:** Keep the app’s package identity and runtime versions stable, create the standalone dependency metadata under the app directory, and run the package-manager install plus Expo compatibility check from that directory before starting an external EAS build.