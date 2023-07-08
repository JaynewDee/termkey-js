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
exports.Prompter = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = __importDefault(require("readline/promises"));
const io_1 = require("./io");
class Prompter {
    static filename() {
        return __awaiter(this, void 0, void 0, function* () {
            let name = '';
            while (!name) {
                const userInput = yield this.rl.question("Enter a name for the file:\n");
                const ext = (0, path_1.extname)(userInput);
                if (io_1.SUPPORTED_FILE_TYPES.includes(ext)) {
                    name = userInput;
                }
            }
            return name;
        });
    }
    static keypath() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            while (!path) {
                const userInput = yield this.rl.question("Enter the path to the cipher's key:\n");
                if ((0, fs_1.existsSync)(userInput)) {
                    path = userInput;
                }
            }
            return path.trim();
        });
    }
}
exports.Prompter = Prompter;
Prompter.rl = promises_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
