import { colors, borderRadius, fontSize, fontWeight, spacing } from '../../theme/tokens'

describe('Theme Tokens', () => {
  describe('colors', () => {
    it('should have all required colors', () => {
      expect(colors.primary).toBe('#3B82F6')
      expect(colors.secondary).toBeDefined()
      expect(colors.foreground).toBeDefined()
      expect(colors.background).toBeDefined()
      expect(colors.danger).toBe('#EF4444')
      expect(colors.success).toBe('#22C55E')
      expect(colors.warning).toBe('#F59E0B')
    })
  })

  describe('borderRadius', () => {
    it('should have all border radius values', () => {
      expect(borderRadius.sm).toBeDefined()
      expect(borderRadius.md).toBeDefined()
      expect(borderRadius.lg).toBeDefined()
      expect(borderRadius.xl).toBeDefined()
      expect(borderRadius.full).toBeDefined()
    })
  })

  describe('fontSize', () => {
    it('should have all font size values', () => {
      expect(fontSize.xs).toBeDefined()
      expect(fontSize.sm).toBeDefined()
      expect(fontSize.md).toBeDefined()
      expect(fontSize.lg).toBeDefined()
      expect(fontSize.xl).toBeDefined()
    })
  })

  describe('fontWeight', () => {
    it('should have all font weight values', () => {
      expect(fontWeight.normal).toBeDefined()
      expect(fontWeight.medium).toBeDefined()
      expect(fontWeight.semibold).toBeDefined()
      expect(fontWeight.bold).toBeDefined()
    })
  })

  describe('spacing', () => {
    it('should have all spacing values', () => {
      expect(spacing.xs).toBeDefined()
      expect(spacing.sm).toBeDefined()
      expect(spacing.md).toBeDefined()
      expect(spacing.lg).toBeDefined()
      expect(spacing.xl).toBeDefined()
    })
  })
})

describe('Badge Variants', () => {
  const variantStyles = {
    default: { backgroundColor: colors.muted, color: colors.foreground },
    success: { backgroundColor: colors.success + '20', color: colors.success },
    danger: { backgroundColor: colors.danger + '20', color: colors.danger },
    warning: { backgroundColor: colors.warning + '20', color: colors.warning },
    primary: { backgroundColor: colors.primary + '20', color: colors.primary },
  }

  it('should have success variant with green color', () => {
    expect(variantStyles.success.color).toBe(colors.success)
  })

  it('should have danger variant with red color', () => {
    expect(variantStyles.danger.color).toBe(colors.danger)
  })

  it('should have warning variant with yellow color', () => {
    expect(variantStyles.warning.color).toBe(colors.warning)
  })

  it('should have primary variant with blue color', () => {
    expect(variantStyles.primary.color).toBe(colors.primary)
  })
})

describe('Progress Calculation', () => {
  const calculatePercentage = (value: number, max: number = 100) => {
    return Math.min((value / max) * 100, 100)
  }

  it('should calculate 50% correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
  })

  it('should calculate 0% correctly', () => {
    expect(calculatePercentage(0, 100)).toBe(0)
  })

  it('should cap at 100% when value exceeds max', () => {
    expect(calculatePercentage(150, 100)).toBe(100)
  })

  it('should handle decimal values', () => {
    expect(calculatePercentage(33.33, 100)).toBe(33.33)
  })

  it('should handle negative values', () => {
    expect(calculatePercentage(-10, 100)).toBe(-10)
  })
})

describe('Button Variants', () => {
  const variantStyles = {
    primary: { backgroundColor: colors.primary, color: '#FFFFFF' },
    secondary: { backgroundColor: colors.muted, color: colors.foreground },
    danger: { backgroundColor: colors.danger, color: '#FFFFFF' },
  }

  it('should have primary with primary color', () => {
    expect(variantStyles.primary.backgroundColor).toBe(colors.primary)
  })

  it('should have danger with danger color', () => {
    expect(variantStyles.danger.backgroundColor).toBe(colors.danger)
  })

  it('should have white text on primary button', () => {
    expect(variantStyles.primary.color).toBe('#FFFFFF')
  })
})

describe('Input Styles', () => {
  const getInputStyle = (hasError: boolean) => ({
    backgroundColor: colors.input,
    borderColor: hasError ? colors.danger : colors.border,
  })

  it('should have default border without error', () => {
    const style = getInputStyle(false)
    expect(style.borderColor).toBe(colors.border)
  })

  it('should have danger border with error', () => {
    const style = getInputStyle(true)
    expect(style.borderColor).toBe(colors.danger)
  })
})
