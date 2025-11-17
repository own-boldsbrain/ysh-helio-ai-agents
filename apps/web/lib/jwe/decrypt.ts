import { jwtDecrypt, EncryptJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWE_SECRET || 'fallback-jwe-secret-change-in-production')

/**
 * Decrypts a JWE (JSON Web Encryption) token
 *
 * @param jwe The encrypted token to decrypt
 * @returns The decrypted payload, or null if decryption fails
 */
export async function decryptJWE<T = any>(jwe: string): Promise<T | null> {
  try {
    const { payload } = await jwtDecrypt(jwe, secret)
    return payload as T
  } catch (error) {
    console.error('JWE decryption failed:', error)
    return null
  }
}

/**
 * Encrypts data using JWE (JSON Web Encryption)
 *
 * @param data The data to encrypt
 * @returns The encrypted JWE token, or null if encryption fails
 */
export async function encryptJWE<T = any>(data: T): Promise<string | null> {
  try {
    const jwe = await new EncryptJWT(data as any).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }).encrypt(secret)

    return jwe
  } catch (error) {
    console.error('JWE encryption failed:', error)
    return null
  }
}
