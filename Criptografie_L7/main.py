from rsa import RSAKey, RSA

alfabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

key = RSAKey(n=46927, e=39423, d=0, j=3, l=4, alfabet=alfabet)
criptat = RSA("YESTERDAY", key)
print("Criptat:", criptat)

from rsa import generare_RSAkey
cheie = generare_RSAkey(alfabet=alfabet)
print(f"n={cheie.n}, e={cheie.e}, d={cheie.d}, j={cheie.j}, l={cheie.l}")

text = "HELLO"
c = RSA(text, cheie)
print("Criptat:", c)
d = RSA(c, cheie, option=True)
print("Decriptat:", d)
