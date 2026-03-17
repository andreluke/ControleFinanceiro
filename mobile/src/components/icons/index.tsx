import React from 'react'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { colors } from '../../theme/tokens'

interface IconProps {
  size?: number
  color?: string
}

const defaultColor = colors.foreground

export const HomeIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const CardIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={2}/>
    <Path d="M2 10h20" stroke={color} strokeWidth={2}/>
  </Svg>
)

export const ChartIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const MenuIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const PlusIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const SearchIcon = ({ size = 24, color = colors.secondary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2}/>
    <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const ArrowUpRightIcon = ({ size = 24, color = colors.success }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 17L17 7M17 7H7M17 7v10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const ArrowDownLeftIcon = ({ size = 24, color = colors.danger }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 7L7 17M7 17H17M7 17V7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const UserIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2}/>
    <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const LockIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="11" width="16" height="11" rx="2" stroke={color} strokeWidth={2}/>
    <Path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const BellIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const MoonIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const RepeatIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 1l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 11V9a4 4 0 014-4h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 23l-4-4 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const DownloadIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const HelpCircleIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const MessageCircleIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const InfoIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const LogOutIcon = ({ size = 24, color = colors.danger }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const ChevronRightIcon = ({ size = 24, color = colors.secondary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const TrendingUpIcon = ({ size = 24, color = colors.success }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 6h6v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const TrendingDownIcon = ({ size = 24, color = colors.danger }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 18l-9.5-9.5-5 5L1 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 18h6v-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const WalletIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V8H6a2 2 0 010-4h8v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="16" cy="12" r="2" fill={color}/>
  </Svg>
)

export const SettingsIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2}/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={2}/>
  </Svg>
)

export const TargetIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={2}/>
    <Circle cx="12" cy="12" r="2" fill={color}/>
  </Svg>
)

export const FolderIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const FilterIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const XIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
)

export const PencilIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const TrashIcon = ({ size = 24, color = colors.danger }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const TagIcon = ({ size = 24, color = defaultColor }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 7h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
)

export const Icons = {
  Home: HomeIcon,
  Card: CardIcon,
  Chart: ChartIcon,
  Menu: MenuIcon,
  Plus: PlusIcon,
  Search: SearchIcon,
  ArrowUpRight: ArrowUpRightIcon,
  ArrowDownLeft: ArrowDownLeftIcon,
  User: UserIcon,
  Lock: LockIcon,
  Bell: BellIcon,
  Moon: MoonIcon,
  Repeat: RepeatIcon,
  Download: DownloadIcon,
  HelpCircle: HelpCircleIcon,
  MessageCircle: MessageCircleIcon,
  Info: InfoIcon,
  LogOut: LogOutIcon,
  ChevronRight: ChevronRightIcon,
  TrendingUp: TrendingUpIcon,
  TrendingDown: TrendingDownIcon,
  Wallet: WalletIcon,
  Settings: SettingsIcon,
  Target: TargetIcon,
  Folder: FolderIcon,
  Filter: FilterIcon,
  X: XIcon,
  Pencil: PencilIcon,
  Trash: TrashIcon,
  Tag: TagIcon,
}
