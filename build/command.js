"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlFlow = void 0;
const encryption_1 = require("./encryption");
const io_1 = require("./io");
const crypto_1 = require("crypto");
const promises_1 = __importDefault(require("readline/promises"));
const process_1 = require("process");
const chalk_1 = __importDefault(require("chalk"));
const { log, error } = console;
// Enable async prompt-based input
const rl = promises_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Alias console formatting
const styles = Object.freeze({
    header: (text) => chalk_1.default.blue(text),
    command: (text) => chalk_1.default.green(text),
    arg: (text) => chalk_1.default.yellow(text),
    title: (text) => chalk_1.default.bgBlue.bold(text)
});
// Expose necessary file handler methods
const { readText, readCipherText, writeKey, writePlainText, writeCipherText } = (0, io_1.FileHandler)();
// High-level command controller
function ControlFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        const [operation, target] = (0, io_1.processArgs)();
        if (!operation && !target) {
            error('FATALITY');
            (0, process_1.exit)(1);
        }
        try {
            yield ExecuteOperation(operation, target);
            (0, process_1.exit)(0);
        }
        catch (err) {
            console.error(err);
            (0, process_1.exit)(1);
        }
    });
}
exports.ControlFlow = ControlFlow;
// Print pretty usage instructions
const displayHelp = () => __awaiter(void 0, void 0, void 0, function* () {
    const { header, command, arg, title } = styles;
    log(`
        ${title("TERMKEY")}

        termkey ${command("<command>")} ${arg("<...args?>")}
        _____________________________
        ${header("Available Commands")}

        ${command("gen")} ::: Generate a secure, unique encryption key
        ${command("encrypt || e")} ${arg("<filename>")} ::: Encrypt a text file and write encrypted ciphertext as .bin
        ${command("decrypt || d")} ${arg("<filename>")} ::: Decrypt a .bin ciphertext file and write with prompted filename  
        `);
    (0, process_1.exit)(0);
});
// Produce cryptographically secure key file
const generateKey = () => __awaiter(void 0, void 0, void 0, function* () {
    const key = (0, encryption_1.keygen)();
    yield writeKey(key);
});
// Encrypt a plaintext file using generated key
// File consists of concatenated cipher + , + iv
const encryptFile = (target) => () => __awaiter(void 0, void 0, void 0, function* () {
    const iv = (0, crypto_1.randomBytes)(16);
    const key = yield readText('cipher_key.bin');
    const plainText = yield readText(target);
    const encrypted = (0, encryption_1.encrypt)(plainText.toString('utf8'), key, iv);
    const filename = target.split(".")[0];
    yield writeCipherText(`${filename}_cipher.bin`, encrypted, iv);
});
// Decrypt using identical parameters
// Prompt user for output file name and write decrypted text 
const decryptFile = (target) => () => __awaiter(void 0, void 0, void 0, function* () {
    const key = yield readText('cipher_key.bin');
    const [text, iv] = yield readCipherText(target);
    const plainText = (0, encryption_1.decrypt)(text, key, Buffer.from(iv, 'hex'));
    const outFileName = yield rl.question("Enter a name for the output file:\n");
    log(`Writing decrypted data to current directory as ${outFileName}`);
    yield writePlainText(outFileName, Buffer.from(plainText).toString('utf8'));
});
// Operation Switch - Execute function based on command line inputs
function ExecuteOperation(op, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const operations = {
            help: displayHelp,
            keygen: generateKey,
            encrypt: encryptFile(target),
            decrypt: decryptFile(target)
        };
        return (yield operations[op]()) || new Error("Invalid operation.  Check your spelling or type help for a list of commands.");
    });
}
