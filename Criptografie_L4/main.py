alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?!."
mod = 30

# matricea inversa A^-1
a, b = 10, 1
c, d = 13, 9

# perechile citite pe coloane: (col1[i], col2[i])
pairs = [(17, 17), (16, 26), (29, 10), (9, 19)]

def decrypt_hill(pairs):
    plaintext = ""
    for x, y in pairs:
        p1 = (a*x + b*y) % mod
        p2 = (c*x + d*y) % mod
        plaintext += alphabet[p1] + alphabet[p2]
    return plaintext

if __name__ == "__main__":
    print("=== Laborator 4: Cifrul Hill — Decriptare ===\n")

    print(f"Alfabet: {alphabet}")
    print(f"Modul:   {mod}\n")

    print("Matricea de criptare A:")
    print("  (27  7)")
    print("  ( 1 20)\n")

    print("Matricea inversa A^-1:")
    print(f"  ({a:2d} {b:2d})")
    print(f"  ({c:2d} {d:2d})\n")

    plaintext = decrypt_hill(pairs)

    print(f"Perechi numerice: {pairs}")
    print(f"Plaintext:        {plaintext}")
