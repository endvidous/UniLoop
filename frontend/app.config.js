module.exports = {
  expo: {
    name: "UniLoop",
    slug: "UniLoop",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/u.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/u.png",
        backgroundColor: "#ffffff",
      },
      package: "com.anonymous.UniLoop",
      googleServicesFile:
        process.env.GOOGLE_SERVICE_JSON || "./android/app/google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/u.png",
    },
    plugins: [
      "expo-router",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/u.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "0cc5717b-c528-4948-adb6-508ec763a9e5",
      },
    },
    owner: "uniloop",
  },
};
