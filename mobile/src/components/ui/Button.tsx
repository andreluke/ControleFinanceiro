import { forwardRef, type ReactNode } from 'react'
import { Pressable, Text, ActivityIndicator, View, type ViewProps, type PressableProps } from 'react-native'
import { colors, borderRadius, fontSize, fontWeight } from '../../theme/tokens'

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
    color: colors.foreground,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: colors.muted,
    color: colors.foreground,
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.foreground,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
    color: colors.foreground,
    borderColor: 'transparent',
  },
}

const sizeStyles = {
  sm: {
    height: 36,
    paddingHorizontal: 12,
    fontSize: fontSize.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: fontSize.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: 20,
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
            borderRadius: borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
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
