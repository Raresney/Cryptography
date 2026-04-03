# Cryptography

Cryptography labs (Python) + interactive web app (React) covering classical ciphers, modern encryption, hashing, SSL/TLS, and OpenSSL.

> Copyright (c) 2026 Bighiu Rares — [github.com/Raresney](https://github.com/Raresney)
> Alexandru Ioan Cuza University of Iasi

---

## Interactive Web App

A dark-themed interactive cryptography toolkit built with React + Vite.

**Features:**
- **CryptoLab** — AES, DES, 3DES encryption/decryption + RSA key generation demo
- **HashLab** — MD5, SHA-1, SHA-256, SHA-512, RIPEMD-160 hash generator + avalanche effect comparison
- **SSL/TLS Explorer** — certificate chain visualization, TLS handshake steps, OpenSSL commands reference
- **Algorithm Visualizer** — step-by-step Caesar cipher and Hill cipher encryption

### Run Locally

```bash
cd app
npm install
npm run dev
```

---

## Python Labs

| Lab | Topic | Files |
| --- | --- | --- |
| [L2](./Criptografie_L2/) | Prime numbers & Miller-Rabin primality test | `main.py` |
| [L3](./Criptografie_L3/) | Extended Euclidean algorithm & modular inverse | `main.py` |
| [L4](./Criptografie_L4/) | Hill cipher — decryption | `main.py` |
| [L7](./Criptografie_L7/) | RSA & Rabin cryptosystems | `helper.py`, `rsa.py`, `rabin.py` |

### L2 — Prime Numbers & Miller-Rabin

| Function | Description |
| --- | --- |
| `prim(n)` | Check if `n` is prime (trial division) |
| `a_la_b_mod_c(a, b, c)` | Modular exponentiation: `a^b mod c` |
| `cmmdc(a, b)` | Greatest common divisor (Euclidean) |
| `test_MillerRabin(n, nr_incercari)` | Miller-Rabin probabilistic primality test |

### L3 — Extended Euclidean & Modular Inverse

| Function | Description |
| --- | --- |
| `cmmdc(a, b)` | GCD (iterative Euclidean) |
| `euclid_extins(a, b)` | Returns `(d, x, y)` where `a*x + b*y = d` |
| `invers(a, m)` | Modular inverse of `a mod m` |

```python
invers(7, 30)   # 13  (7*13 = 91 = 1 mod 30)
invers(10, 30)  # None (gcd(10,30) = 10 != 1)
```

### L4 — Hill Cipher

Decryption using inverse matrix `A^-1`. Alphabet: `ABCDEFGHIJKLMNOPQRSTUVWXYZ?!.` (mod 30)

```
A = (27  7)     A^-1 = (10  1)
    ( 1 20)            (13  9)
```

```python
# Ciphertext: RRQ.KJT? -> Plaintext: HOGWARTS
```

### L7 — RSA & Rabin Cryptosystems

| File | Description |
| --- | --- |
| `helper.py` | GCD, modular exponentiation, modular inverse, primality tests, base conversion |
| `rsa.py` | RSA key generation, block encryption/decryption |
| `rabin.py` | Rabin encryption/decryption with formatting criterion |

```python
from rsa import RSAKey, RSA

key = RSAKey(n=46927, e=39423, d=0, j=3, l=4, alfabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ")
print(RSA("YESTERDAY", key))  # BFICBJHHBIEM
```

---

## Requirements

- Python 3.8+
- Node.js 18+ (for the web app)

## Run

```bash
# Python labs
python Criptografie_L2/main.py
python Criptografie_L3/main.py
python Criptografie_L4/main.py
python Criptografie_L7/rsa.py

# Web app
cd app && npm install && npm run dev
```
