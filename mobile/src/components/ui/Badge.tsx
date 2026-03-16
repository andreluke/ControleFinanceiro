import { Text, View, StyleSheet } from 'react-native'
import { colors, borderRadius, fontSize, fontWeight } from '../../theme/tokens'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'primary'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
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
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const variantStyle = variantStyles[variant]

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: variantStyle.color }]}>{children}</Text>
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
