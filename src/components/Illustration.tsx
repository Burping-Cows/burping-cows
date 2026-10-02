import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { View } from 'react-native';
export function Logo({ size = 110 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 140 120" accessibilityLabel="Burping Cows leaf and horn mark">
    <Path d="M26 35C8 31 3 44 9 50C22 60 37 43 48 35C46 61 29 70 43 96C53 80 66 55 57 32C75 40 94 32 103 18C110 9 117 8 127 7C126 25 113 31 101 33C111 40 109 49 100 51C92 54 83 42 77 38C65 30 42 22 26 35Z" fill="#0B3735" />
    <Path d="M60 107C48 77 70 54 103 50C105 82 82 103 60 107Z" fill="#70AB57" />
    <Path d="M61 106C68 91 81 74 96 60" stroke="#176544" strokeWidth="3" fill="none" />
    <Path d="M111 76C123 67 135 72 135 82C135 91 125 94 117 89M106 100C117 94 125 98 124 105" stroke="#ACD4A6" strokeWidth="9" strokeLinecap="round" fill="none" />
  </Svg>;
}
export function FarmIllustration({ height = 185, captured = false }: { height?: number; captured?: boolean }) {
  return <View style={{ overflow: 'hidden', borderRadius: 18 }}><Svg width="100%" height={height} viewBox="0 0 600 280" preserveAspectRatio="xMidYMax slice" accessibilityLabel={captured ? 'Farm capturing methane for energy' : 'Rolling green hills and a dairy farm'}>
    <Defs><LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#F7FBF3" /><Stop offset="1" stopColor="#DCEEDB" /></LinearGradient></Defs>
    <Rect width="600" height="280" fill="url(#sky)" /><Circle cx="504" cy="69" r="36" fill="#FFEDAE" />
    <Path d="M42 62C45 44 61 44 70 48C82 18 119 22 128 51C150 42 168 54 165 65Z M360 40C366 17 390 20 398 29C413 10 444 18 449 40Z" fill="#E7F4EE" />
    <Path d="M0 178C93 113 167 130 250 157C375 97 460 101 600 153V280H0Z" fill="#C6DFBD" />
    <Path d="M0 171C145 148 212 191 334 218C433 128 523 124 600 152V280H0Z" fill="#8AB66C" />
    <Path d="M0 206C135 176 238 181 355 217C449 200 513 195 600 229V280H0Z" fill="#B8CE83" />
    <Path d="M120 182C250 167 384 192 533 280H413C291 220 218 197 120 182Z" fill="#F0E7B3" />
    <Path d="M338 175V130L385 99L432 130V186Z" fill="#244E4C" /><Path d="M325 131L385 90L446 130L437 136L385 104L337 139Z" fill="#F8FAEE" />
    <Rect x="354" y="147" width="22" height="38" fill="#F5F6E8" /><Rect x="359" y="151" width="12" height="34" fill="#315F59" /><Rect x="397" y="144" width="18" height="15" fill="#C6DFBD" />
    <Rect x="448" y="112" width="30" height="70" rx="3" fill="#769BA0" /><Ellipse cx="463" cy="112" rx="15" ry="11" fill="#ABC5C2" /><Path d="M448 124H478" stroke="#D8E6DF" strokeWidth="3" />
    {[35, 75, 130, 285, 550, 580].map((x, index) => <G key={x}><Path d={`M${x} ${index % 2 ? 105 : 138}V206`} stroke="#476D4D" strokeWidth="4" /><Ellipse cx={x} cy={index % 2 ? 135 : 157} rx={index % 2 ? 13 : 10} ry={index % 2 ? 42 : 28} fill={index % 2 ? '#477C54' : '#659455'} /><Path d={`M${x} ${index % 2 ? 111 : 140}V204`} stroke="#365D48" strokeWidth="2" /></G>)}
    <Path d="M0 249C100 218 156 236 203 280H0Z" fill="#4E8159" /><Path d="M490 280C508 230 560 235 600 255V280Z" fill="#2E644C" />
    <Path d="M12 217L176 240M12 225L176 248M25 209V234M61 213V242M100 218V249M138 226V255" stroke="#F5F6E8" strokeWidth="3" />
    {captured && <G><Path d="M214 176C214 149 254 136 280 176Z" fill="#92BCB9" /><Rect x="214" y="176" width="66" height="23" fill="#648E8A" /><Path d="M236 176V199M265 176V199" stroke="#DCEEDD" strokeWidth="3" /><Path d="M275 164H310V158" stroke="#176544" strokeWidth="5" fill="none" /></G>}
  </Svg></View>;
}
