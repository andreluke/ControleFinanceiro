import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { colors, spacing, borderRadius } from '../../theme/tokens'

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#A855F7', '#D946EF', '#0EA5E9', '#22C55E',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.selectedPreview}>
        <View style={[styles.colorDot, { backgroundColor: value }]} />
        <Text style={styles.colorText}>{value}</Text>
      </View>
      <View style={styles.colorsGrid}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              value === color && styles.selectedColor,
            ]}
            onPress={() => onChange(color)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorText: {
    color: colors.foreground,
    fontSize: 14,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: colors.foreground,
  },
})
