import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler } from "./io"
import { randomBytes } from "crypto"
import readline from 'readline/promises';
import { exit } from 'process'
import chalk from "chalk";
const { log, error } = console;

// Enable async prompt-based input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Alias console formatting
const styles = Object.freeze({
    header: (text: string) => chalk.blue(text),
    command: (text: string) => chalk.green(text),
    arg: (text: string) => chalk.yellow(text),
    title: (text: string) => chalk.bgBlue.bold(text)
})

// Expose necessary file handler methods
const {
    readText,
    readCipherText,
    writeKey,
    writePlainText,
    writeCipherText
} = FileHandler()

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
        ${command("decrypt || e")} ${arg("<filename>")} ::: Decrypt a .bin ciphertext file and write with prompted filename  
        `
    )
    exit(0)
}

// Produce cryptographically secure key file
const generateKey = async () => {
    const key = keygen()
    await writeKey(key)
}

// Encrypt a plaintext file using generated key
// File consists of concatenated cipher + , + iv
const encryptFile = (target: string) => async () => {
    const iv = randomBytes(16)
    const key = await readText('cipher_key.bin')
    const plainText = await readText(target)

    const encrypted = encrypt(plainText.toString('utf8'), key, iv)
    const filename = target.split(".")[0]
    await writeCipherText(`${filename}_cipher.bin`, encrypted, iv)
}

// Decrypt using identical parameters
// Prompt user for output file name and write decrypted text 
const decryptFile = (target: string) => async () => {
    const key = await readText('cipher_key.bin')
    const [text, iv] = await readCipherText(target)
    const plainText = decrypt(text, key, Buffer.from(iv, 'hex'))

    const outFileName = await rl.question("Enter a name for the output file:\n");

    log(`Writing decrypted data to current directory as ${outFileName}`)

    await writePlainText(outFileName, Buffer.from(plainText).toString('utf8'))
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