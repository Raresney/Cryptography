# AES-256 Encryption Engine

AES-256 implementation in C — single file, no dependencies.

Encrypts/decrypts files using a password. Key derivation via PBKDF2-HMAC-SHA256 (100k iterations), random salt + IV per encryption.

## Build

```bash
gcc -O2 -o aes256 aes256.c
```

## Usage

```bash
./aes256 test

./aes256 encrypt -m cbc -p "password" -i secret.txt -o secret.enc
./aes256 decrypt -m cbc -p "password" -i secret.enc -o secret.dec
```

Supported modes: `cbc`, `ctr`, `ecb`

## File format

```
[16-byte salt][16-byte IV][ciphertext...]
```

CTR mode adds an 8-byte original size field before the ciphertext.

## What's in here

- AES-256 (FIPS-197) — S-Box, ShiftRows, MixColumns, 14-round key schedule
- CBC, CTR, ECB modes
- PKCS7 padding
- SHA-256, HMAC-SHA256, PBKDF2
- Random bytes from `/dev/urandom` (PRNG fallback)
- NIST test vectors + round-trip tests

## Note

Not hardened against side-channel attacks. For production, use OpenSSL/libsodium.
