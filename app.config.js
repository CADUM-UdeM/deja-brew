export default {
  expo: {
    name: "study-places",
    slug: "study-places",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "studyplaces",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      userInterfaceStyle: "light",
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
      "package": "com.cadum.dejabrew",
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyBLPZng6Gr0UCGxWrovmdbBaVmptRQEUHs"
        }
      },
    },
    web: {
      output: "single",
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
          backgroundColor: "#FFF6EF",
          dark: {
            backgroundColor: "#FFF6EF",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      EXPO_API_BASE_URL: "https://backend-deja-brew.onrender.com",
      "eas": {
        "projectId": "81075e89-e3f2-42db-aea9-e5f02b8eb4b6"
      }
    }
  },
};
