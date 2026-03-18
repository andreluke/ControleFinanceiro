import { View, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors, borderRadius } from '../../theme/tokens'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: object
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: br = borderRadius.md,
  style,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: br,
          opacity,
        },
        style,
      ]}
    />
  )
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={100} height={16} />
          <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={20} style={{ marginTop: 12 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
})
