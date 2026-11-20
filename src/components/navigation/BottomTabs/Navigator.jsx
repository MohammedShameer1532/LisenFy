
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from '@react-native-vector-icons/ant-design';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '../../screens/Home';
import Library from '../../screens/Library';
import LocalMusic from '../../screens/LocalMusic';
import Setting from '../../screens/Setting';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#07090D',
  dock: '#141922',
  active: '#FFFFFF',
  inactive: '#84909F',
  blue: '#2589FF',
  purple: '#7657FF',
};

// Animated tab icon
const AnimatedTabIcon = ({ focused, label, children }) => {
  const scale = useRef(
    new Animated.Value(focused ? 1 : 0.88),
  ).current;

  const translateY = useRef(
    new Animated.Value(focused ? -2 : 0),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.88,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -2 : 0,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();
  }, [focused, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        {
          transform: [
            { scale },
            { translateY },
          ],
        },
      ]}>
      {focused ? (
        <LinearGradient
          colors={['#2589FF', '#7657FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIcon}>
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.inactiveIcon}>
          {children}
        </View>
      )}

      <Text
        style={[
          styles.label,
          focused && styles.activeLabel,
        ]}>
        {label}
      </Text>

      {focused && <View style={styles.activeDot} />}
    </Animated.View>
  );
};

const Navigator = () => {

  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Tab.Navigator
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: [
            styles.tabBar,
            {
              bottom:
                Platform.OS === 'ios'
                  ? 22
                  : Math.max(insets.bottom, 0),
            },
          ],

          tabBarBackground: () => (
            <View style={styles.backgroundContainer}>
              <LinearGradient
                colors={[
                  '#1B2431',
                  '#121720',
                  '#0E131B',
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),

          tabBarItemStyle: styles.tabItem,
        }}>

        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabIcon
                focused={focused}
                label="Home">
                <AntDesign
                  name="home"
                  size={focused ? 27 : 22}
                  color="#FFFFFF"
                />
              </AnimatedTabIcon>
            ),
          }}
        />

        <Tab.Screen
          name="Library"
          component={Library}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabIcon
                focused={focused}
                label="Library">
                <Ionicons
                  name="library"
                  size={focused ? 27 : 22}
                  color="#FFFFFF"
                />
              </AnimatedTabIcon>
            ),
          }}
        />

        <Tab.Screen
          name="Local"
          component={LocalMusic}
          options={{
            tabBarStyle: { display: 'none' },
            tabBarIcon: ({ focused }) => (
              <AnimatedTabIcon focused={focused} label="Local">
                <MaterialDesignIcons
                  name="music-circle-outline"
                  size={focused ? 30 : 25}
                  color="#FFFFFF"
                />
              </AnimatedTabIcon>
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={Setting}
          options={{
            tabBarIcon: ({ focused }) => (
              <AnimatedTabIcon
                focused={focused}
                label="Settings">
                <Feather
                  name="settings"
                  size={focused ? 26 : 21}
                  color="#FFFFFF"
                />
              </AnimatedTabIcon>
            ),
          }}
        />

      </Tab.Navigator>
    </View>
  );
};

export default Navigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,


    height: 76,

    backgroundColor: 'transparent',
    borderTopWidth: 0,

    elevation: 0,
    paddingTop: 20,
    paddingBottom: 5,
  },

  backgroundContainer: {
    flex: 1,
    marginHorizontal: 0,
    borderRadius: 27,
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',

    backgroundColor: COLORS.dock,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 15,
  },

  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },

  activeIcon: {
    width: 43,
    height: 39,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#438AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 9,
    elevation: 7,
  },

  inactiveIcon: {
    width: 43,
    height: 39,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },

  label: {
    color: COLORS.inactive,
    fontSize: 11,
    fontFamily: 'DMSans-ExtraBold',
    marginTop: 4,
  },

  activeLabel: {
    color: COLORS.active,
    fontFamily: 'Poppins-SemiBold',
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5B9DFF',
    marginTop: 2,
  },
});
