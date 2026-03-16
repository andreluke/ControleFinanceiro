import { forwardRef, type ReactNode } from 'react'
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native'
import { colors, borderRadius, fontSize, spacing } from '../../theme/tokens'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  helperText?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      style,
      ...props
    },
    ref
  ) => {
    const hasError = !!error

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            hasError && styles.inputError,
            !!leftElement && styles.inputWithLeftElement,
            !!rightElement && styles.inputWithRightElement,
          ]}
        >
          {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.secondary}
            selectionColor={colors.primary}
            {...props}
          />
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
        {hasError && <Text style={styles.error}>{error}</Text>}
        {helperText && !hasError && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    )
  }
)

Input.displayName = 'Input'

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputWithLeftElement: {
    paddingLeft: 0,
  },
  inputWithRightElement: {
    paddingRight: 0,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.foreground,
  },
  leftElement: {
    paddingLeft: spacing.md,
  },
  rightElement: {
    paddingRight: spacing.md,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
})
