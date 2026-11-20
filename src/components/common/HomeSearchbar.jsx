
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';

const HomeSearchbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.searchBar}
        onPress={() => navigation.navigate('Commonsearch')}
      >
        <Ionicons name="search" size={20} color="gray" />

        <Text style={styles.placeholder}>
          Search songs, albums, artists...
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeSearchbar;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: '90%',
    height: 48,
  },
  placeholder: {
    flex: 1,
    fontFamily: 'DMSans-Bold',
    color: 'gray',
    marginLeft: 10,
    fontSize: 14,
  },
});
