import math
import random

def prim(n):
    if n < 2: return False
    if n == 2: return True
    if n % 2 == 0: return False
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0: return False
    return True

def a_la_b_mod_c(a, b, c):
    return pow(a, b, c)

def cmmdc(a, b):
    while b:
        a, b = b, a % b
    return a

def test_MillerRabin(n, nr_incercari):
    if n in [0, 1]: return False
    if n == 2: return True
    if n % 2 == 0: return False
    t = n - 1; s = 0
    while t % 2 == 0:
        t = t // 2
        s += 1
    for _ in range(nr_incercari):
        b = random.randint(2, n - 2)
        if cmmdc(b, n) != 1: return False
        p = a_la_b_mod_c(b, t, n)
        if p == 1: continue
        for _ in range(s):
            if p == n - 1: break
            p = (p * p) % n
        if p != n - 1: return False
    return True

if __name__ == "__main__":
    print("=== Laborator 2: Numere Prime & Miller-Rabin ===\n")

    print("--- Test primalitate (trial division) ---")
    teste = [2, 7, 15, 97, 100, 541]
    for n in teste:
        print(f"  prim({n}) = {prim(n)}")

    print("\n--- Ridicare la putere modulara ---")
    print(f"  2^10 mod 1000 = {a_la_b_mod_c(2, 10, 1000)}")
    print(f"  3^13 mod 50   = {a_la_b_mod_c(3, 13, 50)}")

    print("\n--- CMMDC ---")
    print(f"  cmmdc(48, 18) = {cmmdc(48, 18)}")
    print(f"  cmmdc(100, 75) = {cmmdc(100, 75)}")

    print("\n--- Test Miller-Rabin (20 iteratii) ---")
    teste_mr = [7, 561, 997, 1009, 1000000007]
    for n in teste_mr:
        rezultat = test_MillerRabin(n, 20)
        print(f"  Miller-Rabin({n}) = {'PRIM' if rezultat else 'COMPUS'}")
