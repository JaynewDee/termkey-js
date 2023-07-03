import { writeFile, readFile } from 'fs/promises';
import { extname } from 'path';
import { exit } from 'process';

const VALID_FILE_TYPES = ['.txt', '.bin']

function isValidFileName(shouldKeygen: boolean, filename: string) {
  if (shouldKeygen) return true

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

  const shouldEncrypt = op === 'e' || op === 'encrypt'
  const shouldDecrypt = op === 'd' || op === 'decrypt'
  const shouldKeygen = op === 'gen'

  const invalidOp = !shouldEncrypt && !shouldDecrypt && !shouldKeygen

  if (invalidOp) {
    console.error(`Invalid Operation ::: ${op}`)
    exit(1)
  }

  const target = args[3]

  if (!isValidFileName(shouldKeygen, target)) {
    console.error(`No support for filetype ${target}`)
    exit(1)
  }

  if (shouldEncrypt) {
    op = 'encrypt'
  }

  if (shouldDecrypt) {
    op = 'decrypt'
  }

  if (shouldKeygen) {
    op = 'keygen'
  }

  return [op, target]
}

export { processArgs, FileHandler }
