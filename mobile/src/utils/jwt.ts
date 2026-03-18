interface JWTPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function isTokenExpiringSoon(token: string, minutesThreshold = 5): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = payload.exp - now
  const thresholdSeconds = minutesThreshold * 60

  return timeUntilExpiry <= thresholdSeconds
}

export function getTokenExpiryDate(token: string): Date | null {
  const payload = decodeJWT(token)
  if (!payload) return null
  return new Date(payload.exp * 1000)
}
