def cmmdc(a, b):
    while b:
        a, b = b, a % b
    return a

def euclid_extins(a, b):
    if b == 0:
        return a, 1, 0
    d, x, y = euclid_extins(b, a % b)
    return d, y, x - (a // b) * y

def invers(a, m):
    d, x, _ = euclid_extins(a, m)
    if d != 1:
        return None
    return x % m

if __name__ == "__main__":
    print("=== Laborator 3: Euclid Extins & Invers Modular ===\n")

    print("--- CMMDC ---")
    perechi = [(48, 18), (100, 75), (7, 30), (10, 30)]
    for a, b in perechi:
        print(f"  cmmdc({a}, {b}) = {cmmdc(a, b)}")

    print("\n--- Euclid Extins ---")
    for a, b in [(30, 7), (120, 23)]:
        d, x, y = euclid_extins(a, b)
        print(f"  euclid_extins({a}, {b}) = (d={d}, x={x}, y={y})")
        print(f"    Verificare: {a}*{x} + {b}*{y} = {a*x + b*y}")

    print("\n--- Invers Modular ---")
    teste = [(7, 30), (10, 30), (3, 26), (17, 43)]
    for a, m in teste:
        inv = invers(a, m)
        if inv is not None:
            print(f"  invers({a}, {m}) = {inv}  (verificare: {a}*{inv} mod {m} = {(a*inv) % m})")
        else:
            print(f"  invers({a}, {m}) = None  (cmmdc({a},{m}) = {cmmdc(a, m)} != 1)")
