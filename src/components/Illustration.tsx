import React, { useState } from 'react';
import { Asset } from 'expo-asset';
import { Image, Platform, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

const assets = {
  arrow: { source: require('../../assets/figma/arrow.svg'), width: 22, height: 22 },
  readiness: { source: require('../../assets/figma/readiness.png'), width: 98, height: 98 },
  'welcome-farm': { source: require('../../assets/figma/welcome-farm.png'), width: 362, height: 200 },
  'home-farm': { source: require('../../assets/figma/home-farm.png'), width: 326, height: 155 },
  'home-saved-farm': { source: require('../../assets/figma/home-saved-farm.png'), width: 326, height: 155 },
  'assess-farm': { source: require('../../assets/figma/assess-farm.png'), width: 362, height: 185 },
  'project-before': { source: require('../../assets/figma/project-before.svg'), width: 140, height: 85 },
  'project-after': { source: require('../../assets/figma/project-after.svg'), width: 140, height: 85 },
  'results-farm': { source: require('../../assets/figma/results-farm.png'), width: 326, height: 115 },
  'details-farm': { source: require('../../assets/figma/details-farm.png'), width: 326, height: 115 },
  'tab-home': { source: require('../../assets/figma/tab-home.svg'), width: 24, height: 24 },
  'tab-home-active': { source: require('../../assets/figma/tab-home-active.svg'), width: 24, height: 24 },
  'tab-assess-active': { source: require('../../assets/figma/tab-assess-active.svg'), width: 24, height: 24 },
  'tab-assess': { source: require('../../assets/figma/tab-assess.svg'), width: 24, height: 24 },
  'tab-saved': { source: require('../../assets/figma/tab-saved.svg'), width: 24, height: 24 },
  'tab-saved-active': { source: require('../../assets/figma/tab-saved-active.svg'), width: 24, height: 24 },
  'tab-learn': { source: require('../../assets/figma/tab-learn.svg'), width: 24, height: 24 },
  'tab-learn-active': { source: require('../../assets/figma/tab-learn-active.svg'), width: 24, height: 24 },
  'tab-profile': { source: require('../../assets/figma/tab-profile.svg'), width: 24, height: 24 },
  'tab-profile-active': { source: require('../../assets/figma/tab-profile-active.svg'), width: 24, height: 24 },
};
export type DesignAssetName = keyof typeof assets;
export function DesignAsset({ name, fluid = false, label, tintColor }: { name: DesignAssetName; fluid?: boolean; label?: string; tintColor?: string }) {
  const asset = assets[name], module = Asset.fromModule(asset.source), uri = module.uri;
  const [width, setWidth] = useState(asset.width);
  return <View style={{ width: fluid ? '100%' : asset.width, height: asset.height, overflow: 'hidden' }} onLayout={event => setWidth(event.nativeEvent.layout.width)} accessible={Boolean(label)} accessibilityRole={label ? 'image' : undefined} accessibilityLabel={label}>
    {Platform.OS === 'web' || module.type !== 'svg' ? <Image source={{ uri }} style={{ width: '100%', height: asset.height }} resizeMode="stretch" tintColor={tintColor} accessible={false} /> :
      <View style={{ width: asset.width, height: asset.height, transformOrigin: 'left top', transform: [{ scaleX: width / asset.width }] }}><SvgUri uri={uri} /></View>}
  </View>;
}
export function Logo({ size = 110 }: { size?: number }) {
  return <Image source={require('../../assets/branding/green-in-app-logo.png')} style={{ width: size, height: size, borderRadius: 24 }} resizeMode="contain" accessible accessibilityRole="image" accessibilityLabel="Burping Cows green cow silhouette logo" />;
}
export function FarmIllustration({ height = 185, captured = false, variant }: { height?: number; captured?: boolean; variant?: 'home' | 'home-saved' | 'details' }) {
  const name: DesignAssetName = variant === 'home' ? 'home-farm' : variant === 'home-saved' ? 'home-saved-farm' : variant === 'details' ? 'details-farm' : height === 200 ? 'welcome-farm' : height === 115 ? 'results-farm' : height === 85 ? captured ? 'project-after' : 'project-before' : 'assess-farm';
  return <View style={{ overflow: 'hidden', borderRadius: 18 }}><DesignAsset name={name} fluid label={captured ? 'Farm capturing methane for energy' : 'Rolling green hills and a dairy farm'} /></View>;
}
