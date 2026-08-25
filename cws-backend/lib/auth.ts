import { sign, verify } from 'jsonwebtoken'
import { hash, compare } from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '15m' // Access token: 15 minutes
const REFRESH_EXPIRES_IN = '7d' // Refresh token: 7 days

// Generate Access Token
export const generateAccessToken = (payload: any) => {
    return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Generate Refresh Token
export const generateRefreshToken = () => {
    return sign({ random: Math.random() }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
}

// Verify Token
export const verifyToken = (token: string) => {
    try {
        return verify(token, JWT_SECRET) as any
    } catch (err) {
        return null
    }
}

// Hash PIN
export const hashPin = async (pin: string) => {
    return hash(pin, 10)
}

// Verify PIN
export const verifyPin = async (pin: string, hash: string) => {
    return compare(pin, hash)
}