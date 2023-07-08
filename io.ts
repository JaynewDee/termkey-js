// @ts-nocheck
import { writeFile, readFile } from 'fs/promises';
import { extname } from 'path';
import { exit } from 'process';

export const SUPPORTED_FILE_TYPES = ['.txt', '.bin', '.md']

/* Encapsulate file-handling logic */
interface HandlerMethods {
  readText: (filename: string) => Promise<Buffer>,
  readCipherText: (filename: string) => Promise<[string, string]>,
  writePlainText: (filename: string, text: string | Buffer) => Promise<void>,
  writeCipherText: (filename: string, cipher: string, iv: Buffer) => Promise<void>
}

function FileHandler(): HandlerMethods {
  return {
    readText: async (filename) => await readFile(filename),
    readCipherText: async (filename) => {
      const cipherAndIv = await readFile(filename)

      return cipherAndIv.toString('utf8').split(',')
    },
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

  // Each OR is another command alias
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

  const shouldSkipValidate = shouldKeygen || shouldDisplayHelp;

  if (!isSupportedFileName(shouldSkipValidate, target)) {
    console.error(`No support for filetype ${target}`)
    exit(1)
  }


  // Normalize command after checks are passed
  shouldDisplayHelp ? op = 'help'
    : shouldEncrypt ? op = 'encrypt'
      : shouldDecrypt ? op = 'decrypt'
        : shouldKeygen ? op = 'keygen'
          : op = ''

  return [op, target]
}

// Pass true for shouldSkip if command doesn't take filename parameter
function isSupportedFileName(shouldSkip: boolean, filename: string): boolean {
  if (shouldSkip) return true

  const extension = extname(filename)
  return SUPPORTED_FILE_TYPES.includes(extension)
}

export { processArgs, FileHandler }
