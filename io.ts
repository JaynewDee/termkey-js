import { writeFile, readFile } from 'fs/promises';
import { extname } from 'path';
import { exit } from 'process';

const VALID_FILE_TYPES = ['.txt', '.bin']

/* Encapsulate file-handling logic */
interface HandlerMethods {
  readText: (filename: string) => Promise<Buffer>,
  readCipherText: (filename: string) => Promise<[string, string]>,
  writeKey: (key: Buffer) => Promise<void>,
  writePlainText: (filename: string, text: string) => Promise<void>,
  writeCipherText: (filename: string, cipher: string, iv: Buffer) => Promise<void>
}

function FileHandler(): HandlerMethods {
  return {
    readText: async (filename) => await readFile(filename),
    readCipherText: async (filename) => {
      const cipherAndIv = await readFile(filename)

      const [text, iv] = cipherAndIv.toString('utf8').split(',')
      return [text, iv]
    },
    writeKey: async (key) => await writeFile('cipher_key.bin', key),
    writePlainText: async (filename, text) => await writeFile(filename, text),
    writeCipherText: async (filename, cipher, iv) => {
      const writeable = cipher + ',' + iv.toString('hex')

      await writeFile(filename, writeable)

      console.log(`Cipher written to ${filename}`)
    },
  }
}

// Parse and validate command-line arguments
function processArgs(): [string, string] {
  const args = process.argv

  if (args.length < 3) {
    console.error('No argument passed!')
    exit(1)
  }

  let op = args[2]

  const shouldKeygen = op === 'gen' || op === 'keygen'
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

// Pass true for shouldSkip if command doesn't take filename parameter
function isValidFileName(shouldSkip: boolean, filename: string): boolean {
  if (shouldSkip) return true

  const extension = extname(filename)
  return VALID_FILE_TYPES.includes(extension)
}

export { processArgs, FileHandler }
