import { forwardRef, useState, type ReactNode } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, type TextInputProps } from 'react-native'
import { colors, borderRadius, fontSize, spacing } from '../../theme/tokens'
import { Icons } from '../../components/icons'

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
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry)
    const hasError = !!error

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            hasError && styles.inputError,
            !!leftElement && styles.inputWithLeftElement,
            (!!rightElement || secureTextEntry) && styles.inputWithRightElement,
          ]}
        >
          {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.secondary}
            selectionColor={colors.primary}
            secureTextEntry={isSecure}
            {...props}
          />
          <View style={styles.rightElement}>
            {rightElement}
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setIsSecure(!isSecure)}
                style={styles.toggleButton}
              >
                {isSecure ? (
                  <Icons.EyeOff size={20} color={colors.secondary} />
                ) : (
                  <Icons.Eye size={20} color={colors.secondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  toggleButton: {
    padding: spacing.xs,
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
