import math
import random
def prim(n):...
def a_la_b_mod_c(a, b, c):...
def cmmdc(a, b):...
#def test_Fermat(n, nr_incercari):
def test_MillerRabin(n, nr_incercari):
    if n in [0,1]: return False
    if n == 2: return True
    if n % 2 == 0: return False
    t = n - 1; s = 0
    while t % 2 == 0: t = t // 2; s = s + 1
    for _ in range(nr_incercari):
        b = random.randint(2, n - 2)
        if cmmdc(b, n) != 1: return False
        p = a_la_b_mod_c(b, t, n)
        if p == 1: continue
        x = s;
        while True:
            if p == n - 1: break
            p = (p * p) % n
            s-=1
        if p != n - 1: return False
    return True

#def test_MillerRabin2(n , nr_incercari):


#print(test_Fermat(25, 2))
#print(test_Fermat(561, 2))
#print(test_Fermat(97, 2))