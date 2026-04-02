# 🔐 Criptografie — Laboratoare

Colecție de laboratoare practice de criptografie realizate în Python, acoperind algoritmi matematici fundamentali și sisteme de criptare clasice.

> Copyright (c) 2026 Bighiu Rares — [github.com/Raresney](https://github.com/Raresney)  
> Alexandru Ioan Cuza University of Iași — Matematică & Informatică

---

## 📁 Structură

| Laborator                | Subiect                                       | Fișiere   |
| ------------------------ | --------------------------------------------- | --------- |
| [L2](./Criptografie_L2/) | Numere prime & teste de primalitate           | `main.py` |
| [L3](./Criptografie_L3/) | Algoritmul lui Euclid extins & invers modular | `main.py` |
| [L4](./Criptografie_L4/) | Cifrul Hill — decriptare                      | `main.py` |
| [L7](./Criptografie_L7/) | Criptosistemul RSA & Rabin                    | `helper.py`, `rsa.py`, `rabin.py` |

---

## 🔢 L2 — Numere Prime & Miller-Rabin

Funcții matematice de bază pentru criptografie și testare probabilistică a primalității.

| Funcție                             | Descriere                                      |
| ----------------------------------- | ---------------------------------------------- |
| `prim(n)`                           | Verifică dacă `n` e prim (trial division)      |
| `a_la_b_mod_c(a, b, c)`             | Ridicare la putere modulară: `a^b mod c`       |
| `cmmdc(a, b)`                       | Cel mai mare divizor comun (Euclid)            |
| `test_MillerRabin(n, nr_incercari)` | Test probabilistic de primalitate Miller-Rabin |

---

## 🔗 L3 — Euclid Extins & Invers Modular

Implementarea algoritmului lui Euclid extins și calculul inversului modular.

| Funcție               | Descriere                                                       |
| --------------------- | --------------------------------------------------------------- |
| `cmmdc(a, b)`         | Cel mai mare divizor comun (Euclid iterativ)                    |
| `euclid_extins(a, b)` | Returnează `(d, x, y)` cu `a*x + b*y = d`                       |
| `invers(a, m)`        | Inversul lui `a` modulo `m` —> returnează `None` dacă nu există |

**Exemplu:**

```python
invers(7, 30)   # → 13  (7×13 = 91 ≡ 1 mod 30)
invers(10, 30)  # → None (cmmdc(10,30) = 10 ≠ 1)
```

---

## 🔐 L4 — Cifrul Hill

Decriptarea unui mesaj criptat cu cifrul Hill folosind matricea inversă `A⁻¹`.

**Alfabet:** `ABCDEFGHIJKLMNOPQRSTUVWXYZ?!.` (mod 30)

**Matricea de criptare:**

```
A = (27  7)
    ( 1 20)
```

**Matricea inversă calculată:**

```
A⁻¹ = (10  1)
      (13  9)
```

**Exemplu:**

```python
# Cipertext: RRQ.KJT? → Plaintext: HOGWARTS
pairs = [(17,17), (16,26), (29,10), (9,19)]
```

---

## 🔑 L7 — Criptosistemul RSA & Rabin

Implementarea completă a criptosistemului RSA (generare chei, criptare, decriptare) și a criptosistemului Rabin.

| Fișier | Descriere |
| --- | --- |
| `helper.py` | Funcții auxiliare: CMMDC, exponențiere modulară, invers modular, teste de primalitate, conversii baze |
| `rsa.py` | Generare chei RSA, criptare și decriptare pe blocuri de text |
| `rabin.py` | Criptare/decriptare Rabin cu verificare criteriu de formatare (biți repetați) |

**Exemplu RSA:**

```python
from rsa import RSAKey, RSA

alfabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
key = RSAKey(n=46927, e=39423, d=0, j=3, l=4, alfabet=alfabet)
print(RSA("YESTERDAY", key))  # BFICBJHHBIEM
```

**Exemplu Rabin:**

```python
from rabin import criptare_Rabin, decriptare_Rabin

c = criptare_Rabin(109, 2021, x=4)       # 982
radacini, mesaje = decriptare_Rabin(170, 11, 23, x=3)  # m=19
```

---

## ⚙️ Cerințe

- Python 3.8+
- Nicio bibliotecă externă necesară

---

## 🛠️ Rulare

```bash
# L2
python Criptografie_L2/main.py

# L3
python Criptografie_L3/main.py

# L4
python Criptografie_L4/main.py

# L7
python Criptografie_L7/rsa.py
```
