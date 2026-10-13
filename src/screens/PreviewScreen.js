import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import * as Updates from 'expo-updates';
import * as Progress from 'react-native-progress';

import colors from '../utils/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const MIN_DURATION = 6000;

const PreviewScreen = ({ navigation }) => {
  const { hydrated, settings } = useApp();
  const [progress, setProgress] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 550);

    const timer = setTimeout(() => setTimeUp(true), MIN_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // OTA update check (works only in release builds with expo-updates configured)
  useEffect(() => {
    const checkUpdates = async () => {
      if (__DEV__ || !Updates.isEnabled) return;
      try {
        const res = await Updates.checkForUpdateAsync();
        if (res.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log('Update check failed:', e);
      }
    };
    checkUpdates();
  }, []);

  useEffect(() => {
    if (!timeUp || !hydrated || navigated.current) return;
    navigated.current = true;
    navigation.replace(settings.onboarded ? 'Home' : 'Welcome');
  }, [timeUp, hydrated, settings.onboarded, navigation]);

  return (
    <ImageBackground source={require('../../assets/preloader.png')} style={styles.backgroundImg} resizeMode="cover">
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progress}
          width={width * 0.7}
          height={6}
          color={colors.primary}
          unfilledColor="rgba(255,255,255,0.18)"
          borderWidth={0}
          borderRadius={10}
          animated
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.background,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 90,
  },
});

export default PreviewScreen;
