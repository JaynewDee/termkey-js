const { keygen, encrypt, decrypt } = require('./encryption')
const { processArgs, FileHandler } = require('./io')

function main () {
  const { readText, writeKey, writeCipherText } = FileHandler()

  const [operation, target] = processArgs()

  if (!operation || !target) {
    console.error('FATALITY')
    process.exit(1)
  }

  const key = readText('cipher_key.txt')

  if (operation === 'encrypt') {
    const plainText = readText(target)

    console.log(`Encrypting plaintext file: ${target}`)
    const encrypted = encrypt(plainText, key)

    console.log(`Writing ciphertext to file`)
    writeCipherText('ciphertext.txt', encrypted)
  }

  if (operation === 'decrypt') {
    const cipherText = readText(target)
    console.log('Not implemented!')
    process.exit(1)
  }

  //const decrypted = decrypt(encrypted, key);
  //console.log(`Decrypted Text: ${decrypted}`);
  process.exit(0)
}

main()
