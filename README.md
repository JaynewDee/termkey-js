
# _TERMKEY_ [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
     
### *Simple, user-friendly text encryption* 
---

### __Description__

Termkey uses the AES-256-CBC SSL encryption standard along with a password-based key derivation function (PBKDF2)
to encrypt and decrypt sensitive text information. 

---
---
---

## Table of Contents

- __*::: [Installation](#installation) :::*__
        
- __*::: [Usage](#usage) :::*__
        
- __*::: [Contributing](#contributing) :::*__
        
- __*::: [Tests](#tests) :::*__
        
- __*::: [Questions](#questions) :::*__
        
---
---
---



## _Installation_
> `npm i -g termkey` 

---

## _Usage_
        termkey <command> <...args?>
        _____________________________
        Available Commands

        gen ::: Generate a secure, unique encryption key
        encrypt || e <filename> ::: Encrypt a text file and write encrypted ciphertext as .bin
        decrypt || d <filename> ::: Decrypt a .bin ciphertext file and write with prompted filename

---

## _Contributing_
> Reach out to me if you wish to help improve the application! 

---

## _Tests_
> Coming Soon 

---

## _Questions_
> Shoot me an email @ `jdiehl2236@gmail.com` with any questions regarding the termkey package. 

---

## Changelog

### v1.0.5
(7/5/23)
- Added support for specifying output file names.
- Improved UX with adjusted input prompts.