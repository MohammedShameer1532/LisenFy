
import TrackPlayer, { Event } from '@rntp/player';

const playbackService = () => {
  TrackPlayer.addEventListener(Event.PlaybackError, ({ code }) => {
    console.log('Playback error:', code);

    if (code === 'network') {
      TrackPlayer.retry();
    }
  });
};

export default playbackService;
