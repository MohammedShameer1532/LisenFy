import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { Searchcontext } from '../context/Searchcontext';

const Song = () => {
  const { dataSearch, setQrdata } = useContext(Searchcontext);
  console.log('songid',dataSearch);
  
  return (
    <View>
      <Text>Song</Text>
    </View>
  )
}

export default Song

const styles = StyleSheet.create({})