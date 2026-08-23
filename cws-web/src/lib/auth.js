// Token storage keys
const ACCESS_TOKEN_KEY = 'cws_access_token'
const REFRESH_TOKEN_KEY = 'cws_refresh_token'

// Decode JWT payload (no verification — just read)
export const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}

// Get access token
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

// Get refresh token
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

// Set tokens
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

// Clear tokens
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Check if token is expired
export const isTokenExpired = (token) => {
    const payload = decodeToken(token)
    if (!payload || !payload.exp) return true
    return Date.now() >= payload.exp * 1000
}

// Get current user from token
export const getCurrentUser = () => {
    const token = getAccessToken()
    if (!token) return null
    if (isTokenExpired(token)) return null
    return decodeToken(token)
}

// Permission check helper
export const hasPermission = (userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) return false
    return userPermissions.includes(requiredPermission)
}