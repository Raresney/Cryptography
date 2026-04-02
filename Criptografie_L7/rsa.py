import math
import random
from collections import namedtuple
import helper

RSAKey = namedtuple("RSAKey", ["n", "e", "d", "l", "j", "alfabet"])

def generare_RSAkey(j=0, l=0, alfabet=None):
    p = helper.give_prime(2, 100000, 2)
    q = helper.give_prime(2, 100000, p)
    n = p * q
    phi = (p-1) * (q-1)
    e = random.randint(3, phi-1)
    d = helper.invers(e, phi)
    while d is None:
        e += 1
        d = helper.invers(e, phi)
    if alfabet is not None and (j==0 and l==0):
        N = len(alfabet)
        j = int(math.log(n, N))
        l = j + 1
    cheie = RSAKey(n=n, e=e, d=d, j=j, l=l, alfabet=alfabet)
    return cheie

def RSA(text, key, option=False):
    rezultat = ""
    if option:
        key = RSAKey(key.n, key.d, key.e, key.l, key.j, key.alfabet)
    if len(text) % key.j != 0:
        text += key.alfabet[0] * (key.j - len(text) % key.j)
    for k in range(0, len(text), key.j):
        bloc = text[k:k + key.j]
        m = helper.transforma_in_baza_10(bloc, key.alfabet)
        m = helper.a_la_b_mod_c(m, key.e, key.n)
        m = helper.transforma_din_baza_10(m, key.alfabet)
        if len(m) != key.l:
            m = key.alfabet[0] * (key.l - len(m)) + m
        rezultat += m
    return rezultat
