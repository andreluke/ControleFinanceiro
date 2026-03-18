import { Text, View, StyleSheet } from 'react-native'
import { colors, borderRadius, fontSize, fontWeight } from '../../theme/tokens'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'info' | 'secondary' | 'custom'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  style?: object
  bgColor?: string
}

const variantStyles = {
  default: {
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  success: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  danger: {
    backgroundColor: colors.danger + '20',
    color: colors.danger,
  },
  warning: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  primary: {
    backgroundColor: colors.primary + '20',
    color: colors.primary,
  },
  info: {
    backgroundColor: '#3B82F6' + '20',
    color: '#3B82F6',
  },
  secondary: {
    backgroundColor: colors.secondary + '20',
    color: colors.secondary,
  },
  custom: {
    backgroundColor: 'transparent',
    color: colors.foreground,
  },
}

export function Badge({ variant = 'default', children, style, bgColor }: BadgeProps) {
  const variantStyle = variantStyles[variant]
  const isCustom = variant === 'custom' && bgColor

  return (
    <View
      style={[
        styles.badge,
        isCustom 
          ? { backgroundColor: bgColor + '20', borderWidth: 1, borderColor: bgColor }
          : { backgroundColor: variantStyle.backgroundColor },
        style,
      ]}
    >
      <Text style={[styles.text, { color: isCustom ? bgColor : variantStyle.color }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
})
