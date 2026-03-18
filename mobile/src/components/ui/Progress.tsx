import { View, StyleSheet } from 'react-native'
import { colors, borderRadius } from '../../theme/tokens'

interface ProgressProps {
  value: number
  max?: number
  color?: string
  backgroundColor?: string
  height?: number
  style?: object
}

export function Progress({
  value,
  max = 100,
  color = colors.primary,
  backgroundColor = colors.muted,
  height = 8,
  style,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <View style={[styles.container, { backgroundColor, height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
})
