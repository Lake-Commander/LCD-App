# LDCApp

LDC is a camera-first social communication app. The current foundation includes a
native camera studio, on-device segmentation, a local messenger surface, and a
shared-scene room entry point.

## Current functionality

- Camera tab with front/back switching and photo cutout segmentation
- Skia compositing for the captured subject
- Messages tab with a local conversation and message composer
- Rooms tab with the initial shared-scene call entry point
- Lightweight tab shell with no additional navigation dependency
- Supabase client and persisted magic-link session foundation

The messaging and room screens are intentionally local UI foundations at this
stage. They are ready to connect to authentication, a messaging API, and WebRTC
signaling as those services are implemented.

## Supabase setup

1. Copy `.env.example` to `.env` and add the project URL and public anon key.
2. Apply [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. Configure the `ldcapp://auth/callback` redirect URL in Supabase Auth.
4. On iOS, run `cd ios && pod install`; then rebuild the native app after adding
   or changing environment values. Android and iOS receive the values through
   `react-native-config`.

The anon key is intended for client use. Never put a Supabase service-role key
in the mobile app. The database policies are the security boundary for client
queries.

## GitHub build

The Android debug APK is built by
[`.github/workflows/android-debug.yml`](./.github/workflows/android-debug.yml).

Add these repository secrets under **Settings > Secrets and variables >
Actions**:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Push to `main` or run **Build Android debug APK** manually from the Actions tab.
Download `LDCApp-debug-apk` from the completed workflow run, then transfer
`app-debug.apk` to the Android phone and install it. GitHub Actions builds the
APK but cannot directly install it on a physical phone.

Before pushing, keep `.env` and `.env.local` untracked. They are excluded by
`.gitignore`; only the public values are added to GitHub Actions secrets.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Build and run the app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Project structure

```text
App.tsx
src/
├── components/CompositeCanvas.tsx
├── screens/CameraStudioScreen.tsx
├── screens/MessagesScreen.tsx
├── screens/RoomsScreen.tsx
└── utils/maskRenderer.ts
```

The camera and segmentation native integration is currently exposed through
`SegmenterModule`. A device build is required to exercise camera hardware and
native TFLite inference.

## Modify the app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
