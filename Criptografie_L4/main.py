alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?!."
mod = 30

# matricea inversa A^-1
a, b = 10, 1
c, d = 13, 9

# perechile citite pe coloane: (col1[i], col2[i])
pairs = [(17, 17), (16, 26), (29, 10), (9, 19)]

plaintext = ""
for x, y in pairs:
    p1 = (a*x + b*y) % mod
    p2 = (c*x + d*y) % mod
    plaintext += alphabet[p1] + alphabet[p2]

print("Mesaj:", plaintext)