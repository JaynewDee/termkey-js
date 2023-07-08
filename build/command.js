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
const process_1 = require("process");
const chalk_1 = __importDefault(require("chalk"));
const prompt_1 = require("./prompt");
//
const { log, error } = console;
//
// Expose necessary file handler methods
const { readText, readCipherText, writePlainText, writeCipherText } = (0, io_1.FileHandler)();
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
            error(err);
            (0, process_1.exit)(1);
        }
    });
}
exports.ControlFlow = ControlFlow;
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
// Produce cryptographically secure key file
const generateKey = () => __awaiter(void 0, void 0, void 0, function* () {
    const filename = yield prompt_1.Prompter.filename();
    const key = (0, encryption_1.keygen)();
    yield writePlainText(filename, key);
});
// Encrypt a plaintext file using generated key
// File consists of concatenated cipher + ',' + iv
const encryptFile = (target) => () => __awaiter(void 0, void 0, void 0, function* () {
    // The use of an IV prevents the repetition of a sequence of text in data encryption.
    // During encryption, an IV prevents a sequence of plaintext that's identical to
    // a previous plaintext sequence from producing the same ciphertext.
    const iv = (0, crypto_1.randomBytes)(16);
    const plainText = yield readText(target);
    const keyPath = yield prompt_1.Prompter.keypath();
    const outFileName = yield prompt_1.Prompter.filename();
    const key = yield readText(keyPath);
    log(`Ciphertext written to ${outFileName}`);
    const encrypted = (0, encryption_1.encrypt)(plainText.toString('utf8'), key, iv);
    yield writeCipherText(outFileName, encrypted, iv);
});
// Decrypt using identical parameters
// Prompt user for output file name and write decrypted text 
const decryptFile = (target) => () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPath = yield prompt_1.Prompter.keypath();
    const outFileName = yield prompt_1.Prompter.filename();
    const key = yield readText(keyPath);
    const [text, iv] = yield readCipherText(target);
    const plainText = (0, encryption_1.decrypt)(text, key, Buffer.from(iv, 'hex'));
    log(`Writing decrypted data to current directory as ${outFileName}`);
    yield writePlainText(outFileName, Buffer.from(plainText).toString('utf8'));
});
// Alias console formatting
const styles = Object.freeze({
    header: (text) => chalk_1.default.blue(text),
    command: (text) => chalk_1.default.green(text),
    arg: (text) => chalk_1.default.yellow(text),
    title: (text) => chalk_1.default.bgBlue.bold(text)
});
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
