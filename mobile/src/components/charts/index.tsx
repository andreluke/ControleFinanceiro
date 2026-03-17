import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Svg, { G, Circle, Path, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme/tokens'

const screenWidth = Dimensions.get('window').width

interface CategoryData {
  categoryName: string
  color: string
  total: number
  percentage: number
}

interface BarChartData {
  month: string
  income: number
  expense: number
}

interface LineChartData {
  x: string
  y: number
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toFixed(0)
}

const defaultCategoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
]

interface PieChartProps {
  data: CategoryData[]
  title?: string
  innerRadius?: number
}

export const PieChart: React.FC<PieChartProps> = ({ data, title, innerRadius = 55 }) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>Sem dados</Text>
      </View>
    )
  }



  const total = data.reduce((acc, d) => acc + d.total, 0)
  const size = 180
  const outerRadius = size / 2 - 5
  const innerRadiusPx = innerRadius

  const slices = data.reduce((acc, item, index) => {
    const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : -90
    const sliceAngle = (item.total / total) * 360
    const endAngle = startAngle + sliceAngle
    acc.push({
      ...item,
      startAngle,
      endAngle: endAngle - 0.5,
    })
    return acc
  }, [] as (CategoryData & { startAngle: number; endAngle: number })[])

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ')
  }

  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2
    const labelRadius = (outerRadius + innerRadiusPx) / 2
    return polarToCartesian(0, 0, labelRadius, midAngle)
  }

  const renderSlices = () => {
    return slices.map((slice, index) => {
      const slicePath = describeArc(0, 0, outerRadius, slice.startAngle, slice.endAngle)
      const sliceColor = slice.color || defaultCategoryColors[index % defaultCategoryColors.length]
      const midAngle = (slice.startAngle + slice.endAngle) / 2
      const labelRadius = outerRadius + 15
      const labelPos = polarToCartesian(0, 0, labelRadius, midAngle)
      const showLabel = slice.percentage >= 8

      return (
        <G key={index}>
          <Path
            d={slicePath}
            fill={sliceColor}
            stroke={colors.card}
            strokeWidth={3}
          />
          {showLabel && (
            <SvgText
              x={labelPos.x}
              y={labelPos.y}
              fontSize={10}
              fontWeight="bold"
              fill={colors.foreground}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {slice.percentage.toFixed(0)}%
            </SvgText>
          )}
        </G>
      )
    })
  }

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.pieWrapper}>
        <Svg width={size} height={size}>
          <G x={size / 2} y={size / 2}>
            {renderSlices()}
            <Circle r={innerRadiusPx} fill={colors.card} />
          </G>
        </Svg>
        <View style={styles.pieCenter}>
          <Text style={styles.pieCenterValue}>
            {total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
          <Text style={styles.pieCenterLabel}>Total</Text>
        </View>
      </View>
      <View style={styles.legendContainer}>
        {data.slice(0, 5).map((item, index) => {
          const itemColor = item.color || defaultCategoryColors[index % defaultCategoryColors.length]
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: itemColor }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {item.categoryName}
              </Text>
              <Text style={styles.legendPercent}>{item.percentage.toFixed(0)}%</Text>
            </View>
          )
        })}
        {data.length > 5 && (
          <Text style={styles.moreText}>+{data.length - 5} mais</Text>
        )}
      </View>
    </View>
  )
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>Sem dados</Text>
      </View>
    )
  }

  const chartWidth = screenWidth - spacing.md * 4 - 60
  const chartHeight = 180
  const barWidth = Math.min(24, (chartWidth / data.length) / 2.5)
  const gap = 12

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.income, d.expense]),
    1
  )

  const getBarHeight = (value: number) => Math.max((value / maxValue) * (chartHeight - 40), 2)

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.legendInline}>
        <View style={styles.legendInlineItem}>
          <View style={[styles.legendInlineDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendInlineText}>Receitas</Text>
        </View>
        <View style={styles.legendInlineItem}>
          <View style={[styles.legendInlineDot, { backgroundColor: colors.danger }]} />
          <Text style={styles.legendInlineText}>Despesas</Text>
        </View>
      </View>
      <View style={styles.barChartWrapper}>
        <Svg width={chartWidth + 50} height={chartHeight}>
          <Defs>
            <LinearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.success} stopOpacity={1} />
              <Stop offset="100%" stopColor={colors.success} stopOpacity={0.6} />
            </LinearGradient>
            <LinearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.danger} stopOpacity={1} />
              <Stop offset="100%" stopColor={colors.danger} stopOpacity={0.6} />
            </LinearGradient>
          </Defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const value = maxValue * ratio
            const y = chartHeight - 30 - getBarHeight(value) * (chartHeight - 40) / (chartHeight - 40)
            return (
              <G key={i}>
                <Line
                  x1={30}
                  y1={chartHeight - 30 - (chartHeight - 40) * ratio}
                  x2={chartWidth + 30}
                  y2={chartHeight - 30 - (chartHeight - 40) * ratio}
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={25}
                  y={chartHeight - 26 - (chartHeight - 40) * ratio}
                  fontSize={10}
                  fill={colors.secondary}
                  textAnchor="end"
                >
                  {formatCurrency(value)}
                </SvgText>
              </G>
            )
          })}
          {data.map((item, index) => {
            const x = 35 + index * (barWidth * 2 + gap * 2) + gap
            const incomeHeight = getBarHeight(item.income)
            const expenseHeight = getBarHeight(item.expense)
            const baseY = chartHeight - 30
            
            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={baseY - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  fill="url(#incomeGradient)"
                  rx={4}
                />
                <Rect
                  x={x + barWidth + 4}
                  y={baseY - expenseHeight}
                  width={barWidth}
                  height={expenseHeight}
                  fill="url(#expenseGradient)"
                  rx={4}
                />
                <SvgText
                  x={x + barWidth + 2}
                  y={chartHeight - 10}
                  fontSize={10}
                  fill={colors.secondary}
                  textAnchor="middle"
                >
                  {item.month.substring(3)}
                </SvgText>
              </G>
            )
          })}
        </Svg>
      </View>
    </View>
  )
}

interface LineChartProps {
  data: LineChartData[]
  title?: string
  color?: string
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, color = colors.primary }) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>Sem dados</Text>
      </View>
    )
  }

  const chartWidth = screenWidth - spacing.md * 4 - 60
  const chartHeight = 160
  
  const validData = data.filter(d => typeof d.y === 'number' && !isNaN(d.y))
  if (validData.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>Sem dados válidos</Text>
      </View>
    )
  }

  const maxValue = Math.max(...validData.map((d) => d.y), 1)
  const minValue = Math.min(...validData.map((d) => d.y), 0)
  const range = maxValue - minValue || 1

  const divisor = Math.max(validData.length - 1, 1)
  const getX = (index: number) => 35 + (index / divisor) * chartWidth
  const getY = (value: number) => chartHeight - 25 - ((value - minValue) / range) * (chartHeight - 50)

  const pathData = validData.reduce((acc, point, index) => {
    const x = getX(index)
    const y = getY(point.y)
    if (isNaN(x) || isNaN(y)) return acc
    return acc + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')

  const lastX = getX(validData.length - 1)
  const firstX = getX(0)
  const areaPath = isNaN(lastX) || isNaN(firstX) 
    ? pathData 
    : pathData + ` L ${lastX} ${chartHeight - 25} L ${firstX} ${chartHeight - 25} Z`

  const gradientId = `lineGradient_${color.replace('#', '')}`

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.lineChartWrapper}>
        <Svg width={chartWidth + 50} height={chartHeight}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const value = minValue + range * ratio
            const y = getY(value)
            return (
              <G key={i}>
                <Line
                  x1={30}
                  y1={y}
                  x2={chartWidth + 35}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={25}
                  y={y + 4}
                  fontSize={10}
                  fill={colors.secondary}
                  textAnchor="end"
                >
                  {formatCurrency(value)}
                </SvgText>
              </G>
            )
          })}
          <Path d={areaPath} fill={`url(#${gradientId})`} />
          <Path
            d={pathData}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {validData.map((point, index) => {
            const x = getX(index)
            const y = getY(point.y)
            if (isNaN(x) || isNaN(y)) return null
            return (
              <G key={index}>
                <Circle
                  cx={x}
                  cy={y}
                  r={6}
                  fill={colors.card}
                  stroke={color}
                  strokeWidth={3}
                />
              </G>
            )
          })}
          {validData.map((point, index) => (
            <SvgText
              key={`label-${index}`}
              x={getX(index)}
              y={chartHeight - 8}
              fontSize={10}
              fill={colors.secondary}
              textAnchor="middle"
            >
              {point.x.substring(3)}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  pieWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pieCenterValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  pieCenterLabel: {
    fontSize: fontSize.xs,
    color: colors.secondary,
  },
  legendContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.foreground,
  },
  legendPercent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.foreground,
  },
  moreText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  emptyChart: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  legendInline: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  legendInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendInlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInlineText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  barChartWrapper: {
    alignItems: 'center',
  },
  lineChartWrapper: {
    alignItems: 'center',
  },
})
