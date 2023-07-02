const { keygen, encrypt, decrypt } = require('./encryption')
const { processArgs, FileHandler } = require('./io')

function main () {
  const { readKey, writeKey } = FileHandler()

  const plainText = 'Hellooooo!'
  const key = readKey('user_key.txt')

  const encrypted = encrypt(plainText, key)

  console.log(encrypted)

  const [operation, target] = processArgs()

  if (!operation || !target) {
    console.error('Operation? Target?! Where are you ...')
    process.exit(1)
  }

  if (operation === 'encrypt') {
  }

  writeKey(key)

  //const decrypted = decrypt(encrypted, key);
  //console.log(`Decrypted Text: ${decrypted}`);
}

main()
