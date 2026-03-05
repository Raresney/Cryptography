def citeste_alfabet(fisier_alfabet):
    with open(fisier_alfabet, "r", encoding="utf-8") as f:
        alfabet = f.read().strip()
    return alfabet   # string, nu tuple


def transforma_in_baza_10(numar, alfabet):
    rezultat = 0
    N = len(alfabet)

    for litera in numar:
        if litera not in alfabet:
            raise ValueError(f"Caracter invalid: {litera}")
        rezultat = rezultat * N + alfabet.index(litera)

    return rezultat


def transforma_din_baza_10(numar, alfabet):
    if numar == 0:
        return alfabet[0]

    rezultat = ""
    N = len(alfabet)

    while numar > 0:
        rezultat = alfabet[numar % N] + rezultat
        numar //= N

    return rezultat


# ====== MAIN ======

alfabet = citeste_alfabet("C:\\Users\\bighi\\PycharmProjects\\CriptoS2\\alfabet.txt")
print("Alfabet:", alfabet)

n = transforma_in_baza_10("ZECE", alfabet)
print("Baza 10:", n)

back = transforma_din_baza_10(n, alfabet)
print("Înapoi:", back)