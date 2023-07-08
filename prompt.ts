import { extname } from 'path';
import { existsSync } from 'fs';
import readline from 'readline/promises';
import { SUPPORTED_FILE_TYPES } from './io';

export class Prompter {
    private static rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    static async filename() {
        let name = '';

        while (!name) {
            const userInput = await this.rl.question("Enter a name for the file:\n");
            const ext = extname(userInput)
            if (SUPPORTED_FILE_TYPES.includes(ext)) {
                name = userInput
            }
        }

        return name
    }

    static async keypath() {
        let path = '';

        while (!path) {
            const userInput = await this.rl.question("Enter the path to the cipher's key:\n")
            if (existsSync(userInput)) {
                path = userInput
            }
        }

        return path.trim()
    }
}
