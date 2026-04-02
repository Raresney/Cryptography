import helper

def generare_chei_Rabin(minim=2, maxim=100000):
    p = helper.give_prime(minim, maxim, 2)
    while p % 4 != 3:
        p = helper.give_prime(minim, maxim, 2)
    q = helper.give_prime(minim, maxim, p)
    while q % 4 != 3:
        q = helper.give_prime(minim, maxim, p)
    n = p * q
    return n, p, q

def repeta_ultimii_biti(m, x):
    binar = bin(m)[2:]
    ultimii = binar[-x:]
    binar_nou = binar + ultimii
    return int(binar_nou, 2)

def criptare_Rabin(m, n, x):
    m_formatat = repeta_ultimii_biti(m, x)
    c = (m_formatat * m_formatat) % n
    return c

def decriptare_Rabin(c, p, q, x):
    n = p * q

    # Euclid extins: u*p + v*q = 1
    # Folosim invers pentru a gasi u si v
    # u*p ≡ 1 (mod q) => u = invers(p, q)
    # v*q ≡ 1 (mod p) => v = invers(q, p)
    # Dar avem nevoie de u,v din u*p + v*q = 1
    # Folosim algoritmul extins direct:
    def euclid_extins(a, b):
        if b == 0:
            return a, 1, 0
        g, x1, y1 = euclid_extins(b, a % b)
        return g, y1, x1 - (a // b) * y1

    _, u, v = euclid_extins(p, q)

    # r = c^((p+1)/4) mod p
    r = helper.a_la_b_mod_c(c, (p + 1) // 4, p)
    # s = c^((q+1)/4) mod q
    s = helper.a_la_b_mod_c(c, (q + 1) // 4, q)

    # Cele 4 radacini
    x_val = (u * p * s + v * q * r) % n
    y_val = (u * p * s - v * q * r) % n

    radacini = [x_val, n - x_val, y_val, n - y_val]

    # Verificam care radacina respecta criteriul de formatare
    rezultate = []
    for rad in radacini:
        binar = bin(rad)[2:]
        if len(binar) > x:
            ultimii = binar[-x:]
            precedentii = binar[-(2 * x):-x]
            if ultimii == precedentii:
                # Eliminam bitii repetati
                mesaj_binar = binar[:-x]
                mesaj = int(mesaj_binar, 2)
                rezultate.append(mesaj)

    return radacini, rezultate
