import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';
import { DesignAsset, DesignAssetName } from '../../components/Illustration';

const labels: Record<string, string> = { home: 'Home', assess: 'Assess', saved: 'Saved', learn: 'Learn', profile: 'Profile' };
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false }} tabBar={({ state, navigation }) =>
    <View style={{ height: 80 + Math.max(0, insets.bottom - 20), paddingTop: 8, paddingBottom: Math.max(20, insets.bottom), borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cream, flexDirection: 'row', alignItems: 'center' }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const name = ('tab-' + route.name + (focused ? '-active' : '')) as DesignAssetName;
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={labels[route.name]} accessibilityState={{ selected: focused }} aria-selected={focused} onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }} onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <DesignAsset name={name} />
          <Text style={{ fontFamily: 'DM_Sans_500Medium', fontSize: 11, lineHeight: 16, color: focused ? theme.colors.primary : theme.colors.muted }}>{labels[route.name]}</Text>
        </Pressable>;
      })}
    </View>
  }>
    <Tabs.Screen name="home" options={{ title: 'Home' }} />
    <Tabs.Screen name="assess" options={{ title: 'Assess' }} />
    <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
    <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
