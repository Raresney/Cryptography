/* aes256.c — AES-256 encryption engine (ECB/CBC/CTR, PBKDF2-SHA256) */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>

/* --- AES-256 core --- */

#define AES_BLOCK_SIZE 16
#define AES_KEY_SIZE 32
#define AES_ROUNDS 14
#define AES_EXPANDED_KEY_SIZE (4 * (AES_ROUNDS + 1))

static const uint8_t sbox[256] = {
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16};

static const uint8_t inv_sbox[256] = {
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d};

static const uint8_t rcon[11] = {
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36};

static uint8_t gf_mul2(uint8_t a)
{
    return (a << 1) ^ ((a & 0x80) ? 0x1b : 0x00);
}

static uint8_t gf_mul3(uint8_t a)
{
    return gf_mul2(a) ^ a;
}

static uint8_t gf_mul(uint8_t a, uint8_t b)
{
    uint8_t result = 0;
    uint8_t hi;
    for (int i = 0; i < 8; i++)
    {
        if (b & 1)
            result ^= a;
        hi = a & 0x80;
        a <<= 1;
        if (hi)
            a ^= 0x1b;
        b >>= 1;
    }
    return result;
}

typedef struct
{
    uint32_t round_key[AES_EXPANDED_KEY_SIZE];
} aes256_ctx;

static uint32_t sub_word(uint32_t w)
{
    return ((uint32_t)sbox[(w >> 24) & 0xff] << 24) |
           ((uint32_t)sbox[(w >> 16) & 0xff] << 16) |
           ((uint32_t)sbox[(w >> 8) & 0xff] << 8) |
           ((uint32_t)sbox[w & 0xff]);
}

static uint32_t rot_word(uint32_t w)
{
    return (w << 8) | (w >> 24);
}

void aes256_key_expand(aes256_ctx *ctx, const uint8_t key[32])
{
    uint32_t *rk = ctx->round_key;
    int i;

    for (i = 0; i < 8; i++)
    {
        rk[i] = ((uint32_t)key[4 * i] << 24) | ((uint32_t)key[4 * i + 1] << 16) |
                ((uint32_t)key[4 * i + 2] << 8) | (uint32_t)key[4 * i + 3];
    }

    for (i = 8; i < AES_EXPANDED_KEY_SIZE; i++)
    {
        uint32_t tmp = rk[i - 1];
        if (i % 8 == 0)
        {
            tmp = sub_word(rot_word(tmp)) ^ ((uint32_t)rcon[i / 8] << 24);
        }
        else if (i % 8 == 4)
        {
            tmp = sub_word(tmp);
        }
        rk[i] = rk[i - 8] ^ tmp;
    }
}

static void add_round_key(uint8_t state[16], const uint32_t *rk)
{
    for (int i = 0; i < 4; i++)
    {
        state[4 * i + 0] ^= (rk[i] >> 24) & 0xff;
        state[4 * i + 1] ^= (rk[i] >> 16) & 0xff;
        state[4 * i + 2] ^= (rk[i] >> 8) & 0xff;
        state[4 * i + 3] ^= rk[i] & 0xff;
    }
}

static void sub_bytes(uint8_t state[16])
{
    for (int i = 0; i < 16; i++)
        state[i] = sbox[state[i]];
}

static void inv_sub_bytes(uint8_t state[16])
{
    for (int i = 0; i < 16; i++)
        state[i] = inv_sbox[state[i]];
}

static void shift_rows(uint8_t s[16])
{
    uint8_t t;
    t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t;
    t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15];
    s[15] = s[11];
    s[11] = s[7];
    s[7] = s[3];
    s[3] = t;
}

static void inv_shift_rows(uint8_t s[16])
{
    uint8_t t;
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t;
    t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
}

static void mix_columns(uint8_t s[16])
{
    for (int c = 0; c < 4; c++)
    {
        int i = 4 * c;
        uint8_t a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
        s[i + 0] = gf_mul2(a0) ^ gf_mul3(a1) ^ a2 ^ a3;
        s[i + 1] = a0 ^ gf_mul2(a1) ^ gf_mul3(a2) ^ a3;
        s[i + 2] = a0 ^ a1 ^ gf_mul2(a2) ^ gf_mul3(a3);
        s[i + 3] = gf_mul3(a0) ^ a1 ^ a2 ^ gf_mul2(a3);
    }
}

static void inv_mix_columns(uint8_t s[16])
{
    for (int c = 0; c < 4; c++)
    {
        int i = 4 * c;
        uint8_t a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
        s[i + 0] = gf_mul(a0, 0x0e) ^ gf_mul(a1, 0x0b) ^ gf_mul(a2, 0x0d) ^ gf_mul(a3, 0x09);
        s[i + 1] = gf_mul(a0, 0x09) ^ gf_mul(a1, 0x0e) ^ gf_mul(a2, 0x0b) ^ gf_mul(a3, 0x0d);
        s[i + 2] = gf_mul(a0, 0x0d) ^ gf_mul(a1, 0x09) ^ gf_mul(a2, 0x0e) ^ gf_mul(a3, 0x0b);
        s[i + 3] = gf_mul(a0, 0x0b) ^ gf_mul(a1, 0x0d) ^ gf_mul(a2, 0x09) ^ gf_mul(a3, 0x0e);
    }
}

void aes256_encrypt_block(const aes256_ctx *ctx, const uint8_t in[16], uint8_t out[16])
{
    uint8_t state[16];
    memcpy(state, in, 16);

    add_round_key(state, ctx->round_key);

    for (int r = 1; r < AES_ROUNDS; r++)
    {
        sub_bytes(state);
        shift_rows(state);
        mix_columns(state);
        add_round_key(state, ctx->round_key + 4 * r);
    }

    sub_bytes(state);
    shift_rows(state);
    add_round_key(state, ctx->round_key + 4 * AES_ROUNDS);

    memcpy(out, state, 16);
}

void aes256_decrypt_block(const aes256_ctx *ctx, const uint8_t in[16], uint8_t out[16])
{
    uint8_t state[16];
    memcpy(state, in, 16);

    add_round_key(state, ctx->round_key + 4 * AES_ROUNDS);

    for (int r = AES_ROUNDS - 1; r >= 1; r--)
    {
        inv_shift_rows(state);
        inv_sub_bytes(state);
        add_round_key(state, ctx->round_key + 4 * r);
        inv_mix_columns(state);
    }

    inv_shift_rows(state);
    inv_sub_bytes(state);
    add_round_key(state, ctx->round_key);

    memcpy(out, state, 16);
}

/* --- PKCS7 padding --- */

size_t pkcs7_pad(uint8_t *buf, size_t len)
{
    uint8_t pad = AES_BLOCK_SIZE - (len % AES_BLOCK_SIZE);
    for (uint8_t i = 0; i < pad; i++)
        buf[len + i] = pad;
    return len + pad;
}

size_t pkcs7_unpad(const uint8_t *buf, size_t len)
{
    if (len == 0 || len % AES_BLOCK_SIZE != 0)
        return 0;
    uint8_t pad = buf[len - 1];
    if (pad == 0 || pad > AES_BLOCK_SIZE)
        return 0;
    for (uint8_t i = 0; i < pad; i++)
    {
        if (buf[len - 1 - i] != pad)
            return 0;
    }
    return len - pad;
}

/* --- Modes of operation --- */

void aes256_ecb_encrypt(const aes256_ctx *ctx, const uint8_t *in, uint8_t *out, size_t len)
{
    for (size_t i = 0; i < len; i += AES_BLOCK_SIZE)
        aes256_encrypt_block(ctx, in + i, out + i);
}

void aes256_ecb_decrypt(const aes256_ctx *ctx, const uint8_t *in, uint8_t *out, size_t len)
{
    for (size_t i = 0; i < len; i += AES_BLOCK_SIZE)
        aes256_decrypt_block(ctx, in + i, out + i);
}

void aes256_cbc_encrypt(const aes256_ctx *ctx, const uint8_t iv[16],
                        const uint8_t *in, uint8_t *out, size_t len)
{
    uint8_t prev[16];
    memcpy(prev, iv, 16);
    for (size_t i = 0; i < len; i += AES_BLOCK_SIZE)
    {
        uint8_t block[16];
        for (int j = 0; j < 16; j++)
            block[j] = in[i + j] ^ prev[j];
        aes256_encrypt_block(ctx, block, out + i);
        memcpy(prev, out + i, 16);
    }
}

void aes256_cbc_decrypt(const aes256_ctx *ctx, const uint8_t iv[16],
                        const uint8_t *in, uint8_t *out, size_t len)
{
    uint8_t prev[16];
    memcpy(prev, iv, 16);
    for (size_t i = 0; i < len; i += AES_BLOCK_SIZE)
    {
        uint8_t tmp[16];
        aes256_decrypt_block(ctx, in + i, tmp);
        for (int j = 0; j < 16; j++)
            out[i + j] = tmp[j] ^ prev[j];
        memcpy(prev, in + i, 16);
    }
}

static void inc_counter(uint8_t ctr[16])
{
    for (int i = 15; i >= 0; i--)
    {
        if (++ctr[i] != 0)
            break;
    }
}

void aes256_ctr_crypt(const aes256_ctx *ctx, const uint8_t nonce[16],
                      const uint8_t *in, uint8_t *out, size_t len)
{
    uint8_t ctr[16], keystream[16];
    memcpy(ctr, nonce, 16);
    size_t i = 0;
    while (i < len)
    {
        aes256_encrypt_block(ctx, ctr, keystream);
        for (int j = 0; j < 16 && i < len; j++, i++)
            out[i] = in[i] ^ keystream[j];
        inc_counter(ctr);
    }
}

/* --- SHA-256 --- */

typedef struct
{
    uint32_t state[8];
    uint64_t bitcount;
    uint8_t buffer[64];
    uint32_t buflen;
} sha256_ctx;

static const uint32_t sha256_k[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};

#define ROR32(x, n) (((x) >> (n)) | ((x) << (32 - (n))))
#define CH(x, y, z) (((x) & (y)) ^ (~(x) & (z)))
#define MAJ(x, y, z) (((x) & (y)) ^ ((x) & (z)) ^ ((y) & (z)))
#define EP0(x) (ROR32(x, 2) ^ ROR32(x, 13) ^ ROR32(x, 22))
#define EP1(x) (ROR32(x, 6) ^ ROR32(x, 11) ^ ROR32(x, 25))
#define SIG0(x) (ROR32(x, 7) ^ ROR32(x, 18) ^ ((x) >> 3))
#define SIG1(x) (ROR32(x, 17) ^ ROR32(x, 19) ^ ((x) >> 10))

static void sha256_transform(sha256_ctx *c, const uint8_t data[64])
{
    uint32_t w[64], a, b, cd, d, e, f, g, h, t1, t2;
    for (int i = 0; i < 16; i++)
        w[i] = ((uint32_t)data[4 * i] << 24) | ((uint32_t)data[4 * i + 1] << 16) |
               ((uint32_t)data[4 * i + 2] << 8) | data[4 * i + 3];
    for (int i = 16; i < 64; i++)
        w[i] = SIG1(w[i - 2]) + w[i - 7] + SIG0(w[i - 15]) + w[i - 16];

    a = c->state[0];
    b = c->state[1];
    cd = c->state[2];
    d = c->state[3];
    e = c->state[4];
    f = c->state[5];
    g = c->state[6];
    h = c->state[7];

    for (int i = 0; i < 64; i++)
    {
        t1 = h + EP1(e) + CH(e, f, g) + sha256_k[i] + w[i];
        t2 = EP0(a) + MAJ(a, b, cd);
        h = g;
        g = f;
        f = e;
        e = d + t1;
        d = cd;
        cd = b;
        b = a;
        a = t1 + t2;
    }

    c->state[0] += a;
    c->state[1] += b;
    c->state[2] += cd;
    c->state[3] += d;
    c->state[4] += e;
    c->state[5] += f;
    c->state[6] += g;
    c->state[7] += h;
}

void sha256_init(sha256_ctx *c)
{
    c->state[0] = 0x6a09e667;
    c->state[1] = 0xbb67ae85;
    c->state[2] = 0x3c6ef372;
    c->state[3] = 0xa54ff53a;
    c->state[4] = 0x510e527f;
    c->state[5] = 0x9b05688c;
    c->state[6] = 0x1f83d9ab;
    c->state[7] = 0x5be0cd19;
    c->bitcount = 0;
    c->buflen = 0;
}

void sha256_update(sha256_ctx *c, const uint8_t *data, size_t len)
{
    for (size_t i = 0; i < len; i++)
    {
        c->buffer[c->buflen++] = data[i];
        if (c->buflen == 64)
        {
            sha256_transform(c, c->buffer);
            c->bitcount += 512;
            c->buflen = 0;
        }
    }
}

void sha256_final(sha256_ctx *c, uint8_t hash[32])
{
    c->bitcount += c->buflen * 8;
    c->buffer[c->buflen++] = 0x80;
    if (c->buflen > 56)
    {
        while (c->buflen < 64)
            c->buffer[c->buflen++] = 0;
        sha256_transform(c, c->buffer);
        c->buflen = 0;
    }
    while (c->buflen < 56)
        c->buffer[c->buflen++] = 0;
    for (int i = 7; i >= 0; i--)
        c->buffer[56 + (7 - i)] = (c->bitcount >> (i * 8)) & 0xff;
    sha256_transform(c, c->buffer);
    for (int i = 0; i < 8; i++)
    {
        hash[4 * i] = (c->state[i] >> 24) & 0xff;
        hash[4 * i + 1] = (c->state[i] >> 16) & 0xff;
        hash[4 * i + 2] = (c->state[i] >> 8) & 0xff;
        hash[4 * i + 3] = c->state[i] & 0xff;
    }
}

void hmac_sha256(const uint8_t *key, size_t klen,
                 const uint8_t *msg, size_t mlen, uint8_t out[32])
{
    uint8_t kpad[64] = {0};
    sha256_ctx c;

    if (klen > 64)
    {
        sha256_init(&c);
        sha256_update(&c, key, klen);
        sha256_final(&c, kpad);
    }
    else
    {
        memcpy(kpad, key, klen);
    }

    uint8_t ipad[64], opad[64];
    for (int i = 0; i < 64; i++)
    {
        ipad[i] = kpad[i] ^ 0x36;
        opad[i] = kpad[i] ^ 0x5c;
    }

    sha256_init(&c);
    sha256_update(&c, ipad, 64);
    sha256_update(&c, msg, mlen);
    uint8_t inner[32];
    sha256_final(&c, inner);

    sha256_init(&c);
    sha256_update(&c, opad, 64);
    sha256_update(&c, inner, 32);
    sha256_final(&c, out);
}

/* --- PBKDF2 --- */

void pbkdf2_sha256(const uint8_t *pass, size_t plen,
                   const uint8_t *salt, size_t slen,
                   uint32_t iterations, uint8_t *out, size_t dklen)
{
    uint32_t block = 1;
    size_t offset = 0;

    while (offset < dklen)
    {
        uint8_t u[32], t[32];
        uint8_t *sb = malloc(slen + 4);
        memcpy(sb, salt, slen);
        sb[slen] = (block >> 24) & 0xff;
        sb[slen + 1] = (block >> 16) & 0xff;
        sb[slen + 2] = (block >> 8) & 0xff;
        sb[slen + 3] = block & 0xff;
        hmac_sha256(pass, plen, sb, slen + 4, u);
        free(sb);
        memcpy(t, u, 32);

        for (uint32_t i = 1; i < iterations; i++)
        {
            hmac_sha256(pass, plen, u, 32, u);
            for (int j = 0; j < 32; j++)
                t[j] ^= u[j];
        }

        size_t take = dklen - offset;
        if (take > 32)
            take = 32;
        memcpy(out + offset, t, take);
        offset += take;
        block++;
    }
}

int generate_random_bytes(uint8_t *buf, size_t len)
{
    FILE *f = fopen("/dev/urandom", "rb");
    if (!f)
    {
        srand((unsigned)time(NULL));
        for (size_t i = 0; i < len; i++)
            buf[i] = rand() & 0xff;
        return -1;
    }
    size_t r = fread(buf, 1, len, f);
    fclose(f);
    return (r == len) ? 0 : -1;
}

/* --- File encrypt/decrypt --- */

#define PBKDF2_ITERATIONS 100000
#define SALT_SIZE 16

typedef enum
{
    MODE_ECB = 0,
    MODE_CBC = 1,
    MODE_CTR = 2
} cipher_mode;

static void print_hex(const uint8_t *data, size_t len)
{
    for (size_t i = 0; i < len; i++)
        printf("%02x", data[i]);
}

int encrypt_file(const char *inpath, const char *outpath,
                 const char *password, cipher_mode mode)
{
    FILE *fin = fopen(inpath, "rb");
    if (!fin)
    {
        fprintf(stderr, "Error: cannot open %s\n", inpath);
        return 1;
    }
    fseek(fin, 0, SEEK_END);
    long fsize = ftell(fin);
    fseek(fin, 0, SEEK_SET);
    uint8_t *plaintext = malloc(fsize + AES_BLOCK_SIZE);
    fread(plaintext, 1, fsize, fin);
    fclose(fin);

    uint8_t salt[SALT_SIZE], iv[AES_BLOCK_SIZE];
    generate_random_bytes(salt, SALT_SIZE);
    generate_random_bytes(iv, AES_BLOCK_SIZE);

    uint8_t key[AES_KEY_SIZE];
    pbkdf2_sha256((const uint8_t *)password, strlen(password),
                  salt, SALT_SIZE, PBKDF2_ITERATIONS, key, AES_KEY_SIZE);

    aes256_ctx ctx;
    aes256_key_expand(&ctx, key);

    size_t padded_len = (mode == MODE_CTR) ? (size_t)fsize : pkcs7_pad(plaintext, fsize);
    uint8_t *ciphertext = malloc(padded_len);

    switch (mode)
    {
    case MODE_ECB:
        aes256_ecb_encrypt(&ctx, plaintext, ciphertext, padded_len);
        break;
    case MODE_CBC:
        aes256_cbc_encrypt(&ctx, iv, plaintext, ciphertext, padded_len);
        break;
    case MODE_CTR:
        aes256_ctr_crypt(&ctx, iv, plaintext, ciphertext, padded_len);
        break;
    }

    FILE *fout = fopen(outpath, "wb");
    if (!fout)
    {
        fprintf(stderr, "Error: cannot open %s\n", outpath);
        free(plaintext);
        free(ciphertext);
        return 1;
    }
    fwrite(salt, 1, SALT_SIZE, fout);
    fwrite(iv, 1, AES_BLOCK_SIZE, fout);
    if (mode == MODE_CTR)
    {
        uint8_t sz[8];
        for (int i = 7; i >= 0; i--)
        {
            sz[i] = fsize & 0xff;
            fsize >>= 8;
        }
        fwrite(sz, 1, 8, fout);
    }
    fwrite(ciphertext, 1, padded_len, fout);
    fclose(fout);

    printf("Encrypted %s -> %s (%s mode)\n", inpath, outpath,
           mode == MODE_ECB ? "ECB" : mode == MODE_CBC ? "CBC"
                                                       : "CTR");
    printf("  Salt: ");
    print_hex(salt, SALT_SIZE);
    printf("\n");
    printf("  IV:   ");
    print_hex(iv, AES_BLOCK_SIZE);
    printf("\n");

    memset(key, 0, AES_KEY_SIZE);
    memset(&ctx, 0, sizeof(ctx));
    free(plaintext);
    free(ciphertext);
    return 0;
}

int decrypt_file(const char *inpath, const char *outpath,
                 const char *password, cipher_mode mode)
{
    FILE *fin = fopen(inpath, "rb");
    if (!fin)
    {
        fprintf(stderr, "Error: cannot open %s\n", inpath);
        return 1;
    }
    fseek(fin, 0, SEEK_END);
    long total = ftell(fin);
    fseek(fin, 0, SEEK_SET);

    uint8_t salt[SALT_SIZE], iv[AES_BLOCK_SIZE];
    fread(salt, 1, SALT_SIZE, fin);
    fread(iv, 1, AES_BLOCK_SIZE, fin);

    size_t original_size = 0;
    size_t header = SALT_SIZE + AES_BLOCK_SIZE;
    if (mode == MODE_CTR)
    {
        uint8_t sz[8];
        fread(sz, 1, 8, fin);
        for (int i = 0; i < 8; i++)
            original_size = (original_size << 8) | sz[i];
        header += 8;
    }

    size_t ct_len = total - header;
    uint8_t *ciphertext = malloc(ct_len);
    fread(ciphertext, 1, ct_len, fin);
    fclose(fin);

    uint8_t key[AES_KEY_SIZE];
    pbkdf2_sha256((const uint8_t *)password, strlen(password),
                  salt, SALT_SIZE, PBKDF2_ITERATIONS, key, AES_KEY_SIZE);

    aes256_ctx ctx;
    aes256_key_expand(&ctx, key);

    uint8_t *plaintext = malloc(ct_len);

    switch (mode)
    {
    case MODE_ECB:
        aes256_ecb_decrypt(&ctx, ciphertext, plaintext, ct_len);
        break;
    case MODE_CBC:
        aes256_cbc_decrypt(&ctx, iv, ciphertext, plaintext, ct_len);
        break;
    case MODE_CTR:
        aes256_ctr_crypt(&ctx, iv, ciphertext, plaintext, ct_len);
        break;
    }

    size_t out_len;
    if (mode == MODE_CTR)
    {
        out_len = original_size;
    }
    else
    {
        out_len = pkcs7_unpad(plaintext, ct_len);
        if (out_len == 0)
        {
            fprintf(stderr, "Error: invalid padding (wrong password or corrupt file)\n");
            free(ciphertext);
            free(plaintext);
            memset(key, 0, AES_KEY_SIZE);
            memset(&ctx, 0, sizeof(ctx));
            return 1;
        }
    }

    FILE *fout = fopen(outpath, "wb");
    fwrite(plaintext, 1, out_len, fout);
    fclose(fout);

    printf("Decrypted %s -> %s (%s mode)\n", inpath, outpath,
           mode == MODE_ECB ? "ECB" : mode == MODE_CBC ? "CBC"
                                                       : "CTR");

    memset(key, 0, AES_KEY_SIZE);
    memset(&ctx, 0, sizeof(ctx));
    free(ciphertext);
    free(plaintext);
    return 0;
}

static void usage(const char *prog)
{
    fprintf(stderr,
            "AES-256 Encryption Engine\n"
            "Usage:\n"
            "  %s encrypt -m <ecb|cbc|ctr> -p <password> -i <input> -o <output>\n"
            "  %s decrypt -m <ecb|cbc|ctr> -p <password> -i <input> -o <output>\n"
            "  %s test    (run NIST test vectors)\n",
            prog, prog, prog);
}

int run_tests(void)
{
    const uint8_t test_key[32] = {
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
        0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f};
    const uint8_t test_plain[16] = {
        0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
        0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff};
    const uint8_t expected_cipher[16] = {
        0x8e, 0xa2, 0xb7, 0xca, 0x51, 0x67, 0x45, 0xbf,
        0xea, 0xfc, 0x49, 0x90, 0x4b, 0x49, 0x60, 0x89};

    aes256_ctx ctx;
    aes256_key_expand(&ctx, test_key);

    uint8_t cipher[16], plain[16];
    aes256_encrypt_block(&ctx, test_plain, cipher);
    aes256_decrypt_block(&ctx, cipher, plain);

    printf("=== AES-256 NIST Test Vector (FIPS-197 C.3) ===\n");
    printf("Key:       ");
    print_hex(test_key, 32);
    printf("\n");
    printf("Plaintext: ");
    print_hex(test_plain, 16);
    printf("\n");
    printf("Expected:  ");
    print_hex(expected_cipher, 16);
    printf("\n");
    printf("Got:       ");
    print_hex(cipher, 16);
    printf("\n");
    printf("Decrypt:   ");
    print_hex(plain, 16);
    printf("\n");

    int pass = (memcmp(cipher, expected_cipher, 16) == 0) &&
               (memcmp(plain, test_plain, 16) == 0);
    printf("Result:    %s\n\n", pass ? "PASS" : "FAIL");

    /* CBC round-trip test */
    printf("=== CBC Round-Trip Test ===\n");
    const char *msg = "AES-256-CBC round trip test with PKCS7 padding!";
    size_t mlen = strlen(msg);
    uint8_t *buf = malloc(mlen + 16);
    memcpy(buf, msg, mlen);
    size_t padded = pkcs7_pad(buf, mlen);

    uint8_t iv[16] = {0};
    uint8_t *ct = malloc(padded), *pt = malloc(padded);
    aes256_cbc_encrypt(&ctx, iv, buf, ct, padded);
    aes256_cbc_decrypt(&ctx, iv, ct, pt, padded);
    size_t unpadded = pkcs7_unpad(pt, padded);

    printf("Original:  %s\n", msg);
    printf("Cipher:    ");
    print_hex(ct, padded);
    printf("\n");
    printf("Decrypted: %.*s\n", (int)unpadded, pt);
    int pass2 = (unpadded == mlen) && (memcmp(pt, msg, mlen) == 0);
    printf("Result:    %s\n\n", pass2 ? "PASS" : "FAIL");

    /* CTR round-trip test */
    printf("=== CTR Round-Trip Test ===\n");
    const char *msg2 = "CTR mode doesn't need padding for arbitrary-length data.";
    size_t m2len = strlen(msg2);
    uint8_t nonce[16] = {0x42};
    uint8_t *ct2 = malloc(m2len), *pt2 = malloc(m2len);
    aes256_ctr_crypt(&ctx, nonce, (const uint8_t *)msg2, ct2, m2len);
    aes256_ctr_crypt(&ctx, nonce, ct2, pt2, m2len);

    printf("Original:  %s\n", msg2);
    printf("Cipher:    ");
    print_hex(ct2, m2len);
    printf("\n");
    printf("Decrypted: %.*s\n", (int)m2len, pt2);
    int pass3 = (memcmp(pt2, msg2, m2len) == 0);
    printf("Result:    %s\n", pass3 ? "PASS" : "FAIL");

    free(buf);
    free(ct);
    free(pt);
    free(ct2);
    free(pt2);
    return (pass && pass2 && pass3) ? 0 : 1;
}

int main(int argc, char **argv)
{
    if (argc < 2)
    {
        usage(argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "test") == 0)
        return run_tests();

    if (argc < 10)
    {
        usage(argv[0]);
        return 1;
    }

    int encrypting = (strcmp(argv[1], "encrypt") == 0);
    char *mode_str = NULL, *password = NULL, *infile = NULL, *outfile = NULL;

    for (int i = 2; i < argc - 1; i += 2)
    {
        if (strcmp(argv[i], "-m") == 0)
            mode_str = argv[i + 1];
        else if (strcmp(argv[i], "-p") == 0)
            password = argv[i + 1];
        else if (strcmp(argv[i], "-i") == 0)
            infile = argv[i + 1];
        else if (strcmp(argv[i], "-o") == 0)
            outfile = argv[i + 1];
    }

    if (!mode_str || !password || !infile || !outfile)
    {
        usage(argv[0]);
        return 1;
    }

    cipher_mode mode;
    if (strcmp(mode_str, "ecb") == 0)
        mode = MODE_ECB;
    else if (strcmp(mode_str, "cbc") == 0)
        mode = MODE_CBC;
    else if (strcmp(mode_str, "ctr") == 0)
        mode = MODE_CTR;
    else
    {
        fprintf(stderr, "Unknown mode: %s\n", mode_str);
        return 1;
    }

    if (encrypting)
        return encrypt_file(infile, outfile, password, mode);
    else
        return decrypt_file(infile, outfile, password, mode);
}