import { writeFile, readFile } from 'fs/promises';
import { extname } from 'path';
import { exit } from 'process';

const VALID_FILE_TYPES = ['.txt', '.bin']

function isValidFileName(shouldSkip: boolean, filename: string) {
  if (shouldSkip) return true

  const extension = extname(filename)
  return VALID_FILE_TYPES.includes(extension)
}

function FileHandler() {
  return {
    readText: async (filename: string) => await readFile(filename),
    readCipherText: async (filename: string) => {
      const cipherAndIv = await readFile(filename)

      const [text, iv] = cipherAndIv.toString('utf8').split(',')
      return [text, iv]
    },
    writeKey: async (key: Buffer) => await writeFile('cipher_key.bin', key),
    writePlainText: async (filename: string, text: string) => await writeFile(filename, text),
    writeCipherText: async (filename: string, cipher: string, iv: Buffer) => {
      const writeable = cipher + ',' + iv.toString('hex')

      await writeFile(filename, writeable)

      console.log(`Cipher written to ${filename}`)
    },
  }
}

/*
  Arguments Format: 
  node main.js <operation> <path_to_txt_file>>
*/

function processArgs(): [string, string] {
  const args = process.argv

  if (args.length < 3) {
    console.error('No argument passed!')
    exit(1)
  }

  let op = args[2]

  const shouldKeygen = op === 'gen'
  const shouldEncrypt = op === 'e' || op === 'encrypt'
  const shouldDecrypt = op === 'd' || op === 'decrypt'
  const shouldDisplayHelp = op === "h" || op === "help";

  const invalidOp = !shouldEncrypt && !shouldDecrypt && !shouldKeygen && !shouldDisplayHelp

  if (invalidOp) {
    console.error(`Invalid Operation ::: ${op}`)
    exit(1)
  }

  const target = args[3]

  if (!isValidFileName(shouldKeygen || shouldDisplayHelp, target)) {
    console.error(`No support for filetype ${target}`)
    exit(1)
  }

  shouldDisplayHelp ? op = 'help'
    : shouldEncrypt ? op = 'encrypt'
      : shouldDecrypt ? op = 'decrypt'
        : shouldKeygen ? op = 'keygen'
          : op = ''

  return [op, target]
}

export { processArgs, FileHandler }
