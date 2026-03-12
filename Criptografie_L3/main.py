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
        return None  # inversul nu exista daca cmmdc(a, m) != 1
    return x % m