import { keygen, encrypt, decrypt } from './encryption'
import { processArgs, FileHandler } from "./io"
import { randomBytes } from "crypto"
import { exit } from 'process'

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
        ExecuteOperation(operation, target);
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

    console.log(`Writing decrypted data to txt file in current directory`)
    await writePlainText('decrypted.txt', Buffer.from(plainText).toString('utf8'))
}

async function ExecuteOperation(op: string, target: string) {
    const operations: { [key: string]: any } = {
        keygen: generateKey,
        encrypt: encryptFile(target),
        decrypt: decryptFile(target)
    }
    return operations[op]() || new Error("Invalid operation.  Check your spelling and type help for a list of commands.")
}