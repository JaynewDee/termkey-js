const { writeFileSync, readFileSync } = require('fs')
const { extname } = require('path')
const { tmpdir } = require('os')
const { exit } = process

/*
  const CipherObject = {
    text,
    iv
  }
*/
class Cipher {
  static serialize (obj) {
    return JSON.stringify(obj)
  }

  static deserialize (textStr) {
    return JSON.parse(textStr)
  }
}

const VALID_FILE_TYPES = ['.txt']

function isValidFileName (filename) {
  const extension = extname(filename)
  return extension in VALID_FILE_TYPES
}

const FileHandler = () => ({
  readText: filename => readFileSync(filename),
  writeKey: key => writeFileSync('cipher_key.txt', key),
  writeCipherText: (filename, cipher, iv) => {
    const serializedCipher = Cipher.serialize({ text: cipher, iv })
    writeFileSync(filename, serializedCipher)
    console.log(`Cipher written to ${filename}`)
  },
  writeToTemp: (filename, content) =>
    writeFileSync(tmpdir() + filename, content)
})

/*
  Arguments Format: 
  node main.js <operation> <path_to_plaintext>
*/

function processArgs () {
  const args = process.argv

  if (args.length < 3) {
    console.error('No argument passed!')
    exit(1)
  }

  const op = args[2]

  const shouldEncrypt = op === 'e' || op === 'encrypt'
  const shouldDecrypt = op === 'd' || op === 'decrypt'
  const shouldKeygen = op === 'gen'

  if (!shouldEncrypt && !shouldDecrypt && !shouldKeygen) {
    console.error(`Invalid Operation ::: ${op}`)
    exit(1)
  }

  const target = args[3]

  if (!target) {
    console.error(`Please specify a destination for your decryption key file.`)
    exit(1)
  }

  if (!isValidFileName(target)) {
    console.error(`No support for filetype ${target}`)
    exit(1)
  }

  if (shouldEncrypt) {
    return ['encrypt', target]
  }

  if (shouldDecrypt) {
    return ['decrypt', target]
  }

  if (shouldKeygen) {
    return ['keygen', target]
  }

  return ['', null]
}

module.exports = { processArgs, FileHandler }
