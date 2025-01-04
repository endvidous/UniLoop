import { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Badge,
  Calendar,
  CheckMark,
  Exclamation,
  Headphones,
  Lightbulb,
  Reading,
  Stopwatch,
  Sumo,
  UniloopText,
} from "@/assets/svgs/splashSvgs";

export default function SplashScreen() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const centerX = 0; // Center X
  const centerY = 0; // Center Y
  const radiusX = (screenWidth * 0.8) / 2; // 80% of screen width
  const radiusY = (screenHeight * 0.8) / 2; // 80% of screen height
  const movementRange = 30; // Small movement range

  const svgs = [
    Badge,
    Calendar,
    CheckMark,
    Exclamation,
    Lightbulb,
    Reading,
    Headphones,
    Stopwatch,
  ].map((Component, index, array) => {
    // Calculate angle for each SVG
    const angle = (2 * Math.PI * index) / array.length;

    // Initial positions (ellipse formula)
    const iX = centerX + radiusX * Math.cos(angle);
    const iY = centerY + radiusY * Math.sin(angle);

    // Final positions (add small random movement)
    const fX = iX + Math.random() * movementRange - movementRange / 2;
    const fY = iY + Math.random() * movementRange - movementRange / 2;

    return {
      Component,
      iX: useSharedValue(iX),
      iY: useSharedValue(iY),
      fX: useSharedValue(fX),
      fY: useSharedValue(fY),
    };
  });

  useEffect(() => {
    svgs.forEach((svg) => {
      svg.iX.value = withRepeat(
        withTiming(svg.fX.value, { duration: 2000 }),
        -1,
        true
      );
      svg.iY.value = withRepeat(
        withTiming(svg.fY.value, { duration: 2000 }),
        -1,
        true
      );
    });
  }, []);

  const getAnimatedStyle = (index: number) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: svgs[index].iX.value },
        { translateY: svgs[index].iY.value },
      ],
    }));

  return (
    <View style={styles.container}>
      {svgs.map(({ Component }, index) => (
        <Animated.View
          key={index}
          style={[getAnimatedStyle(index), styles.svg]}
        >
          <Component />
        </Animated.View>
      ))}
      <View style={styles.sumo}>
        <Sumo />
      </View>
      <View style={styles.uniloop}>
        <UniloopText />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  uniloop: {
    alignItems: "center",
    bottom: 40,
  },
  sumo: {
    alignItems: "center",
    bottom: 10,
  },
});
