// Adapted from jrhea/library-of-babel (d7a1c8af973e98c413b87205698d28c9c61d850d).
// SPDX-License-Identifier: Apache-2.0; see public/licenses/babel-upstream.txt.
// Changes: domain-sized moduli, coprimality checks, and a nonnegative inverse.
const A = 6364136223846793005n;
const C = 1n;

function modinv(a, m) {
  let [t, newT] = [0n, 1n];
  let [r, newR] = [m, a];
  while (newR !== 0n) {
    const q = r / newR;
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  if (r !== 1n) return null;
  return t < 0n ? t + m : t;
}

export function makePermutation(modulus) {
  let a = A % modulus || 1n;
  let inverse = modinv(modulus % a, a);
  while (inverse === null) {
    a += 1n;
    inverse = modinv(modulus % a, a);
  }
  return {
    scramble: n => (a * n + C) % modulus,
    unscramble(n) {
      // Find k modulo a such that (n - C + k * modulus) is exactly divisible by a.
      // Euclid runs on 64-bit operands and the inverse avoids multiplying two page-sized integers.
      const difference = n - C;
      const correction = (a - ((difference % a) * inverse) % a) % a;
      const result = (difference + correction * modulus) / a;
      return result < 0n ? result + modulus : result;
    },
  };
}
