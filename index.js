/**
 * @format
 */
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import TrackPlayer from '@rntp/player'
import Layout from './src/components/navigation/TabLayout/Layout';
import playbackService from './src/components/services/Playbackservice';

TrackPlayer.registerPlaybackSession(playbackService);
AppRegistry.registerComponent(appName, () => Layout);