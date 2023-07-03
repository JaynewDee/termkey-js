import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler } from "./io"
import { randomBytes } from "crypto"
const { exit } = process

main()

async function main() {
  const {
    readText,
    readCipherText,
    writeKey,
    writePlainText,
    writeCipherText
  } = FileHandler()

  const [operation, target] = processArgs()

  if (!operation && !target) {
    console.error('FATALITY')
    exit(1)
  }

  if (operation === 'keygen') {
    const key = keygen()
    await writeKey(key)

    exit(0)
  }

  if (operation === 'encrypt') {
    const iv = randomBytes(16)
    const key = await readText('cipher_key.bin')
    const plainText = await readText(target)

    const encrypted = encrypt(plainText.toString('utf8'), key, iv)

    console.log(`Text at encryption: ${encrypted}`)
    console.log(`IV at encryption: ${iv.toString('utf8')}`)
    console.log(`Key at encryption: ${key.toString('utf8')}`)
    await writeCipherText('cipher_text.bin', encrypted, iv)
    exit(0)
  }

  if (operation === 'decrypt') {
    const key = await readText('cipher_key.bin')
    const [text, iv] = await readCipherText(target)
    console.log(`Text at decryption: ${text}`)
    const ivBuff = Buffer.from(iv, 'hex')
    console.log(`IV at decryption: ${ivBuff.toString('utf8')}`)
    console.log(`Key at decryption: ${key.toString('utf8')}`)

    console.log(`Writing ciphertext to file`)
    const plainText = decrypt(text, key, ivBuff)

    console.log(`Writing decrypted data to txt file in current directory`)
    await writePlainText('decrypted.txt', Buffer.from(plainText).toString('utf8'))

    exit(0)
  }

  exit(1)
}
