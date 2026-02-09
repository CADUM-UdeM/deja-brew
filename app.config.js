export default {
  expo: {
    name: "study-places",
    slug: "study-places",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "studyplaces",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-font",
      "expo-web-browser",
      "expo-router",
      "expo-maps",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      EXPO_GEMINI_API_KEY: process.env.EXPO_GEMINI_API_KEY,
      EXPO_API_BASE_URL: process.env.EXPO_API_BASE_URL || "https://backend-deja-brew.onrender.com",
    },
  },
};
