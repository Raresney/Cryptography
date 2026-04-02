import random

def cmmdc(a, b):
    if a<0: a = -a
    if b<0: b = -b
    if a==0 or b==0: return a+b
    while (b):
        r = a%b; a = b; b = r
    return a

def a_la_b_mod_c(a,b,c):
    a %= c
    p = 1
    while b:
        if b%2==1:
            p = (p*a)%c
        a = (a*a)%c
        b //= 2
    return p

def invers(a, N):
    copy_N = N
    x1 = 1; x2 = 0
    while N:
        r = a % N
        x = x1 - (a//N) * x2
        x1 = x2
        x2 = x
        a = N
        N = r
    if (a == 1):
        return x1 % copy_N
    return None

def prim(n):
    if n == 0 or n == 1: return False
    if n == 2: return True
    if n % 2 == 0: return False
    for i in range(3, int(n**0.5), 2):
        if n % i == 0: return False
    return True

def fermat_test(n, nr_incercari):
    if (n == 2): return True
    if (n % 2 == 0): return False
    for i in range(nr_incercari):
        b = random.randint(2, n-1)
        if (cmmdc(b, n) != 1): return False
        if (a_la_b_mod_c(b, n-1, n) != 1): return False
    return True

def check_prime(n, nr_incercari=3):
    return fermat_test(n, nr_incercari) and prim(n)

def give_prime(minim, maxim, value):
    if minim > maxim: return None
    if minim == maxim:
        if check_prime(minim): return minim
        else: return None
    nrAleator = random.randint(minim, maxim)
    for p in range(nrAleator, maxim+1):
        if check_prime(p) and p != value: return p
    for p in range(minim, maxim):
        if check_prime(p) and p != value: return p
    return None

def transforma_din_baza_10(numar, alfabet):
    rezultat = ""
    N = len(alfabet)
    while (numar > 0):
        rezultat += alfabet[numar % N]
        numar = numar // N
    return rezultat[::-1]

def transforma_in_baza_10(numar, alfabet):
    rezultat = 0
    N = len(alfabet)
    for letter in numar:
        rezultat = rezultat * N + alfabet.index(letter)
    return rezultat

def get_text(fisier_sursa):
    with open(fisier_sursa, "r", encoding="utf-8") as f:
        text = f.read()
    return text

def write_text(fisier_destinatie, text):
    with open(fisier_destinatie, "w", encoding="utf-8") as f:
        f.write(text)

#print(f"7 este prim? {prim(7)}")
#print(f"12 este prim? {prim(12)}")
#print(f"97 este prim? {prim(97)}")
#print(f"100 este prim? {prim(100)}")