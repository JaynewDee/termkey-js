import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler } from "./io"
import { randomBytes } from "crypto"
import readline from 'readline/promises';
import { exit } from 'process'


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const {
    readText,
    readCipherText,
    writeKey,
    writePlainText,
    writeCipherText
} = FileHandler()

export async function ControlFlow() {
    const [operation, target] = processArgs()

    if (!operation && !target) {
        console.error('FATALITY')
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

const generateKey = async () => {
    const key = keygen()
    await writeKey(key)
}

const encryptFile = (target: string) => async () => {
    const iv = randomBytes(16)
    const key = await readText('cipher_key.bin')
    const plainText = await readText(target)

    const encrypted = encrypt(plainText.toString('utf8'), key, iv)
    const filename = target.split(".")[0]
    await writeCipherText(`${filename}_cipher.bin`, encrypted, iv)
}

const decryptFile = (target: string) => async () => {
    const key = await readText('cipher_key.bin')

    const [text, iv] = await readCipherText(target)
    const ivBuff = Buffer.from(iv, 'hex')

    const plainText = decrypt(text, key, ivBuff)

    const outFileName = await rl.question("Enter a name for the output file:\n");
    console.log(`Writing decrypted data to current directory as ${outFileName}`)
    await writePlainText(outFileName, Buffer.from(plainText).toString('utf8'))
}

const displayHelp = async () => {
    console.log(
        `
        termkey <command> <...args?>
        _____________________________
        Available Commands

        gen ::: Generate a secure, unique encryption key
        encrypt|e <filename> ::: Encrypt a text file and write encrypted ciphertext as .bin
        decrypt|e <filename> ::: Decrypt a .bin ciphertext file and write with prompted filename  
        `
    )
    exit(0)
}

async function ExecuteOperation(op: string, target: string) {
    const operations: { [key: string]: any } = {
        help: displayHelp,
        keygen: generateKey,
        encrypt: encryptFile(target),
        decrypt: decryptFile(target)
    }

    return await operations[op]() || new Error("Invalid operation.  Check your spelling and type help for a list of commands.")
}