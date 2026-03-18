import { forwardRef, type ReactNode } from 'react'
import { Pressable, Text, ActivityIndicator, View, type ViewProps, type PressableProps } from 'react-native'
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../../theme/tokens'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ViewProps {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  disabled?: boolean
  children?: ReactNode
  onPress?: PressableProps['onPress']
}

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: colors.muted,
    color: colors.foreground,
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: colors.card,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: colors.muted + '40',
    color: colors.foreground,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
    color: '#FFFFFF',
    borderColor: 'transparent',
  },
}

const sizeStyles = {
  sm: {
    height: 40,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  md: {
    height: 48,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
  },
  lg: {
    height: 56,
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.lg,
  },
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      onPress,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant]
    const sizeStyle = sizeStyles[size]

    return (
      <Pressable
        ref={ref}
        disabled={disabled || isLoading}
        onPress={onPress}
        style={[
          {
            backgroundColor: variantStyle.backgroundColor,
            borderWidth: variant === 'outline' ? 1 : 0,
            borderColor: variantStyle.borderColor,
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            borderRadius: variant === 'primary' ? 100 : borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: spacing.sm,
          },
          variant === 'primary' && {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          },
          disabled && { opacity: 0.5 },
        ]}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variantStyle.color} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text
              style={{
                color: variantStyle.color,
                fontSize: sizeStyle.fontSize,
                fontWeight: fontWeight.semibold,
              }}
            >
              {children}
            </Text>
            {rightIcon}
          </>
        )}
      </Pressable>
    )
  }
)

Button.displayName = 'Button'
