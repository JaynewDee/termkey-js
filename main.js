const { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } = require('crypto');
const { writeFileSync, readFileSync } = require('fs');
const { tmpdir } = require('os');

main();
// Define encryption algorithm to use
const ALGO = 'aes-256-gcm';
// AES256-GCM
// Advanced Encryption Standard in Galois Counter Mode

const iv = Buffer.from(randomBytes(16));

// The use of an IV prevents the repetition of a sequence of text in data encryption. Specifically, during encryption, an IV prevents a sequence of plaintext that's identical to a previous plaintext sequence from producing the same ciphertext.

// Key is securely generated using pbkdf2, a key derivation function with a sliding computational cost, 
// used to reduce vulnerability to brute-force attacks
function keygen() {
	// "Password" entropy determines cryptographic operations applied to key
	const entropy = Buffer.from(randomBytes(16));
	// Should be random and at least 16 bytes long
	const salt = Buffer.from(randomBytes(16));
	// Password-Based Key Derivation Function 2 (PBKDF2).
	return pbkdf2Sync(entropy, salt, 100000, 32, 'sha256')
}

// File IO
const writeKey = (key) => writeFileSync('user_key.txt', key);
const readKey = (filename) => readFileSync(filename);
const writeToTemp = (content, filename) => writeFileSync(tmpdir() + filename, content);

function encrypt(plainText, key) {
	const cipher = createCipheriv(ALGO, key, iv);
	return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encryptedText, key, iv) {
	const decipher = createDecipheriv(ALGO, key, iv);
	return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
}

function processArgs() {
	const args = process.argv;

	if (args.length < 3) {
		console.error("No argument passed!");
		process.exit(1);
	}

	const shouldEncrypt = args[2] === "e" || args[2] === "encrypt";
	const shouldDecrypt = args[2] === "d" || args[2] === "decrypt";

	if (!shouldEncrypt && !shouldDecrypt) {
		console.error(`Invalid Argument ::: ${args[2]}`);
		process.exit(1);
	}

	const target = args[4];

	if (shouldEncrypt && target) {
		return ["encrypt", target];
	}
}

function main() {
	const plainText = "Hellooooo!";
	const key = readKey("user_key.txt");

	const encrypted = encrypt(plainText, key);

	console.log(encrypted);

	const [operation, target] = processArgs();

	if (!operation || !target) {
		console.error("Operation? Target?! Where are you ...");
		process.exit(1);
	}

	if (operation === "encrypt") {

	}

	console.log(operation);

	console.log(`Encrypted Text: ${cipherText}`);

	writeKey(key);

	//const decrypted = decrypt(encrypted, key);
	//console.log(`Decrypted Text: ${decrypted}`);
}
