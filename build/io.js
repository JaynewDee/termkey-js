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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = exports.processArgs = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const process_1 = require("process");
const VALID_FILE_TYPES = ['.txt', '.bin'];
function FileHandler() {
    return {
        readText: (filename) => __awaiter(this, void 0, void 0, function* () { return yield (0, promises_1.readFile)(filename); }),
        readCipherText: (filename) => __awaiter(this, void 0, void 0, function* () {
            const cipherAndIv = yield (0, promises_1.readFile)(filename);
            const [text, iv] = cipherAndIv.toString('utf8').split(',');
            return [text, iv];
        }),
        writeKey: (key) => __awaiter(this, void 0, void 0, function* () { return yield (0, promises_1.writeFile)('cipher_key.bin', key); }),
        writePlainText: (filename, text) => __awaiter(this, void 0, void 0, function* () { return yield (0, promises_1.writeFile)(filename, text); }),
        writeCipherText: (filename, cipher, iv) => __awaiter(this, void 0, void 0, function* () {
            const writeable = cipher + ',' + iv.toString('hex');
            yield (0, promises_1.writeFile)(filename, writeable);
            console.log(`Cipher written to ${filename}`);
        }),
    };
}
exports.FileHandler = FileHandler;
// Parse and validate command-line arguments
function processArgs() {
    const args = process.argv;
    if (args.length < 3) {
        console.error('No argument passed!');
        (0, process_1.exit)(1);
    }
    let op = args[2];
    const shouldKeygen = op === 'gen';
    const shouldEncrypt = op === 'e' || op === 'encrypt';
    const shouldDecrypt = op === 'd' || op === 'decrypt';
    const shouldDisplayHelp = op === "h" || op === "help";
    const invalidOp = !shouldEncrypt && !shouldDecrypt && !shouldKeygen && !shouldDisplayHelp;
    if (invalidOp) {
        console.error(`Invalid Operation ::: ${op}`);
        (0, process_1.exit)(1);
    }
    const target = args[3];
    if (!isValidFileName(shouldKeygen || shouldDisplayHelp, target)) {
        console.error(`No support for filetype ${target}`);
        (0, process_1.exit)(1);
    }
    shouldDisplayHelp ? op = 'help'
        : shouldEncrypt ? op = 'encrypt'
            : shouldDecrypt ? op = 'decrypt'
                : shouldKeygen ? op = 'keygen'
                    : op = '';
    return [op, target];
}
exports.processArgs = processArgs;
// Pass true for shouldSkip if command doesn't take filename parameter
function isValidFileName(shouldSkip, filename) {
    if (shouldSkip)
        return true;
    const extension = (0, path_1.extname)(filename);
    return VALID_FILE_TYPES.includes(extension);
}
