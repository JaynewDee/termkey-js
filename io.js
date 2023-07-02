const { writeFileSync, readFileSync } = require('fs')
const { tmpdir } = require('os')

const FileHandler = () => ({
  readKey: filename => readFileSync(filename),
  writeKey: key => writeFileSync('cipher_key.txt', key),
  writeCiphertext: (filename, cipher) => writeFileSync(filename, cipher),
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
    process.exit(1)
  }

  const op = args[2]

  const shouldEncrypt = op === 'e' || op === 'encrypt'
  const shouldDecrypt = op === 'd' || op === 'decrypt'

  if (!shouldEncrypt && !shouldDecrypt) {
    console.error(`Invalid Operation ::: ${op}`)
    process.exit(1)
  }

  const target = args[3]

  if (shouldEncrypt && target) {
    return ['encrypt', target]
  }

  if (shouldDecrypt && target) {
    return ['decrypt', target]
  }

  return ['', null]
}

module.exports = { processArgs, FileHandler }
