import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
export default function TabsLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.colors.primary, tabBarInactiveTintColor: theme.colors.muted, tabBarStyle: { backgroundColor: theme.colors.cream, borderTopColor: theme.colors.border, height: 80, paddingTop: 8, paddingBottom: 20 }, tabBarLabelStyle: { fontFamily: 'DM_Sans_500Medium', fontSize: 11 } }}>
  <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant-outline" color={color} size={size} /> }} />
  <Tabs.Screen name="assess" options={{ title: 'Assess', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-check-outline" color={color} size={size} /> }} />
  <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bookmark-outline" color={color} size={size} /> }} />
  <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="book-open-page-variant-outline" color={color} size={size} /> }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} /> }} />
 </Tabs>; }
