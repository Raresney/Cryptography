def invers(a, N):
    copy_N = N
    x1 = 1;
    x2 = 0
    while N:
        r = a % N

        x = x1 - (a // N) * x2
        x1 = x2
        x2 = x

        a = N
        N = r
    if (a == 1):
        return x1 % N
    return None