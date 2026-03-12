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