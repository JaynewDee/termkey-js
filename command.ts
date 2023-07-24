import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler } from "./io"
import { randomBytes } from "crypto"
import { exit } from 'process'
import chalk from "chalk";
import { Prompter } from './prompt';

//
const { log, error } = console;
//

// Expose necessary file handler methods
const {
    readText,
    readCipherText,
    writePlainText,
    writeCipherText
} = FileHandler()

// High-level command controller
export async function ControlFlow() {
    const [operation, target] = processArgs()

    if (!operation && !target) {
        throw new Error('FATALITY. One or more required arguments not present.')
    }

    try {
        await ExecuteOperation(operation, target);
        exit(0)
    } catch (err) {
        error(err);
        throw err;
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

    try {
        return await operations[op]()
    } catch (err) {
        throw new Error("Invalid operation.  Check your spelling or type help for a list of commands.")
    }
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
    // The use of an IV prevents the repetition of a sequence of text in data encryption.
    // During encryption, an IV prevents a sequence of plaintext that's identical to
    // a previous plaintext sequence from producing the same ciphertext.

    const iv = randomBytes(16)
    const plainText = await readText(target)

    const [keyPath, outFileName] = await Prompter.key_and_filename();
    const key = await readText(keyPath)

    log(`Ciphertext written to ${outFileName}`)

    const encrypted = encrypt(plainText.toString('utf8'), key, iv)
    await writeCipherText(outFileName, encrypted, iv)
}

// Decrypt using identical parameters
// Prompt user for output file name and write decrypted text 
const decryptFile = (target: string) => async () => {
    const [keyPath, outFileName] = await Prompter.key_and_filename();

    const key = await readText(keyPath)
    const [text, iv] = await readCipherText(target)

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

