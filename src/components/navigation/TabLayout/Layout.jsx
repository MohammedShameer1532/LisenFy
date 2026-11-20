
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native';
import {
  PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrackPlayer, { PlayerCommand } from '@rntp/player';
import Navigator from '../BottomTabs/Navigator';
import Commonsearch from '../../common/CommonSearch';
import Song from '../../HomeSection/Song';
import Album from '../../HomeSection/Album';
import Artist from '../../HomeSection/Artist';
import Playlist from '../../HomeSection/Playlist';
import { SearchProvider } from '../../context/Searchcontext';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const [playerReady, setPlayerReady] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    let mounted = true;

    const initializePlayer = async () => {
      try {
        await TrackPlayer.setupPlayer({
          contentType: 'music',
          handleAudioBecomingNoisy: true,
          cache: {
            maxSizeBytes: 500 * 1024 * 1024,
            preloading: {
              window: 1,
            },
          },
          android: {
            wakeMode: 'network',
            taskRemovedBehavior: 'continue',
            notification: {
              channelId: 'lisenfy-playback',
              channelName: 'LisenFy Music Playback',
              smallIcon: 'ic_launcher',
            },
          },
        });
        TrackPlayer.setVolume(1)
        TrackPlayer.setCommands({
          capabilities: [
            PlayerCommand.PlayPause,
            PlayerCommand.Next,
            PlayerCommand.Previous,
            PlayerCommand.Seek,
            PlayerCommand.Stop,
            PlayerCommand.SkipBackward,
            PlayerCommand.SkipForward,
          ],
          forwardInterval: 10,
          backwardInterval: 10,
        });

        if (mounted) setPlayerReady(true);
      } catch (error) {
        console.error('LisenFy player initialization failed:', error);
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
    };
  }, []);

  if (!playerReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Navigator" component={Navigator} />
        <Stack.Screen name="Commonsearch" component={Commonsearch} options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} />
        <Stack.Screen name="Song" component={Song} options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} />
         <Stack.Screen name="Album" component={Album} options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} />
         <Stack.Screen name="Artist" component={Artist} options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} />
         <Stack.Screen name="Playlist" component={Playlist} options={{
          headerShown: false,
          animation: 'slide_from_right',
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Layout = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SearchProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <PaperProvider theme={isDark ? MD3DarkTheme : MD3LightTheme}>
            <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
              <RootNavigator />
            </ThemeProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </SearchProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: '#07090D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
