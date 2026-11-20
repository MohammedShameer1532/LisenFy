import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TrackPlayer from '@rntp/player'
import { SafeAreaView } from 'react-native-safe-area-context'
import HomeSearchbar from '../common/HomeSearchbar'

const Home = () => {

  // TrackPlayer.setMediaItems([
  //   {
  //     artworkUrl: 'https://c.saavncdn.com/868/This-is-Kaadhal-3-Tamil-2026-20260206191032-500x500.jpg',
  //     url: 'https://aac.saavncdn.com/868/c2d2ed1ef12648a59236d0be2eb58c03_320.mp4',
  //     artist: 'Santhosh Narayanan',
  //   }
  // ])
  return (
    <View>
      <StatusBar
        backgroundColor="#000000"
        barStyle="light-content"
        translucent={false}
      />
      <SafeAreaView>
        <HomeSearchbar />
      </SafeAreaView>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})