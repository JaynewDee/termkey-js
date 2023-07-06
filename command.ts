import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler, SUPPORTED_FILE_TYPES } from "./io"
import { randomBytes } from "crypto"
import readline from 'readline/promises';
import { extname } from 'path';
import { existsSync } from 'fs';
import { exit } from 'process'
import chalk from "chalk";
const { log, error } = console;

// Expose necessary file handler methods
const {
    readText,
    readCipherText,
    writePlainText,
    writeCipherText
} = FileHandler()

// Enable async prompt-based input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class Prompter {
    static async filename() {
        let name = '';

        while (!name) {
            const userInput = await rl.question("Enter a name for the file:\n");
            const ext = extname(userInput)
            const isValid = SUPPORTED_FILE_TYPES.includes(ext)
            if (isValid) {
                name = userInput
            }
        }

        return name
    }
    static async keypath() {
        let path = '';

        while (!path) {
            const userInput = await rl.question("Enter the path to the cipher's key:\n")
            if (existsSync(userInput)) {
                path = userInput
            }
        }
        return path.trim()
    }
}

// High-level command controller
export async function ControlFlow() {
    const [operation, target] = processArgs()

    if (!operation && !target) {
        error('FATALITY')
        exit(1)
    }

    try {
        await ExecuteOperation(operation, target);
        exit(0)
    } catch (err) {
        console.error(err);
        exit(1)
    }
}

// Operation Switch - Execute function based on command line inputs
async function ExecuteOperation(op: string, target: string) {
    const operations: { [key: string]: any } = {
        help: displayHelp,
        keygen: generateKey,
        encrypt: encryptFile(target),
        decrypt: decryptFile(target)
    }

    return await operations[op]() || new Error("Invalid operation.  Check your spelling or type help for a list of commands.")
}

// Produce cryptographically secure key file
const generateKey = async () => {
    const filename = await Prompter.filename();
    const key = keygen()
    await writePlainText(filename, key)
}

// Encrypt a plaintext file using generated key
// File consists of concatenated cipher + ',' + iv
const encryptFile = (target: string) => async () => {
    const iv = randomBytes(16)
    const keyPath = await Prompter.keypath();

    const key = await readText(keyPath)
    const plainText = await readText(target)

    const filename = await Prompter.filename()

    log(`Ciphertext written to ${filename}`)

    const encrypted = encrypt(plainText.toString('utf8'), key, iv)
    await writeCipherText(filename, encrypted, iv)
}

// Decrypt using identical parameters
// Prompt user for output file name and write decrypted text 
const decryptFile = (target: string) => async () => {
    const keyPath = await Prompter.keypath();
    const key = await readText(keyPath)
    const [text, iv] = await readCipherText(target)

    const outFileName = await Prompter.filename();

    const plainText = decrypt(text, key, Buffer.from(iv, 'hex'))

    log(`Writing decrypted data to current directory as ${outFileName}`)

    await writePlainText(outFileName, Buffer.from(plainText).toString('utf8'))
}

// Alias console formatting
const styles = Object.freeze({
    header: (text: string) => chalk.blue(text),
    command: (text: string) => chalk.green(text),
    arg: (text: string) => chalk.yellow(text),
    title: (text: string) => chalk.bgBlue.bold(text)
})

// Print pretty usage instructions
const displayHelp = async () => {
    const { header, command, arg, title } = styles;

    log(
        `
        ${title("TERMKEY")}

        termkey ${command("<command>")} ${arg("<...args?>")}
        _____________________________
        ${header("Available Commands")}

        ${command("gen")} ::: Generate a secure, unique encryption key
        ${command("encrypt || e")} ${arg("<filename>")} ::: Encrypt a text file and write encrypted ciphertext as .bin
        ${command("decrypt || d")} ${arg("<filename>")} ::: Decrypt a .bin ciphertext file and write with prompted filename  
        `
    )
    exit(0)
}

