import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', 'hex') // 32 bytes for AES-256

/**
 * Encrypts a string value
 *
 * @param text The text to encrypt
 * @returns The encrypted string in format "iv:encrypted"
 */
export function encrypt(text: string): string {
  try {
    const iv = randomBytes(16) // Initialization vector
    const cipher = createCipheriv(ALGORITHM, KEY, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Return IV and encrypted data
    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Encryption failed')
  }
}

/**
 * Decrypts an encrypted string
 *
 * @param encryptedText The encrypted text in format "iv:encrypted"
 * @returns The decrypted string
 */
export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(':')

    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted text format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const decipher = createDecipheriv(ALGORITHM, KEY, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Decryption failed')
  }
}
