import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync
} from 'crypto'
// Define encryption algorithm to use
const ALGO = 'aes-256-cbc'
// AES256-CBC

// Why an Initialization Vector?
// 
// The use of an IV prevents the repetition of a sequence of text in data encryption.
// Specifically, during encryption, an IV prevents a sequence of plaintext that's identical to
// a previous plaintext sequence from producing the same ciphertext.

// Key is securely generated using pbkdf2, a key derivation function with a sliding computational cost,
// used to reduce vulnerability to brute-force attacks
function keygen() {
  // "Password" entropy determines cryptographic operations applied to key
  const entropy = Buffer.from(randomBytes(16))
  // Should be random and at least 16 bytes long
  const salt = Buffer.from(randomBytes(16))
  // Password-Based Key Derivation Function 2 (PBKDF2).
  return pbkdf2Sync(entropy, salt, 100000, 32, 'sha256')
}

//////////////

function encrypt(plainText: string, key: Buffer, iv: Buffer): string {
  // Create, update, and finalize are separate operations to allow
  // for streaming, a welcome feature when encrypting/decrypting large data sets
  const cipher = createCipheriv(ALGO, key, iv)
  // update takes data/plainText, inputEncoding, outputEncoding
  return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex')
}

function decrypt(encryptedText: string, key: Buffer, iv: Buffer): string {
  // All required arguments must be identical to encryption cipher used
  const decipher = createDecipheriv(ALGO, key, iv)
  return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
}

export {
  keygen,
  encrypt,
  decrypt
}

