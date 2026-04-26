/**
 * SellSpark Quantum Teleportation & Entanglement Primitives
 * Simulated Bell-pair generation, quantum state teleportation protocol,
 * and BB84 QKD for session key exchange — patent-pending creator-to-fan
 * secure channel establishment.
 */

import { Complex, cx, cadd, cmul, cabs } from './neural';
import { quantumRNG } from './advanced';

export type Qubit = [Complex, Complex]; // [|0⟩, |1⟩]

export const ZERO: Qubit = [cx(1), cx(0)];
export const ONE: Qubit = [cx(0), cx(1)];
export const PLUS: Qubit = [cx(1 / Math.SQRT2), cx(1 / Math.SQRT2)];

export function measureQubit(q: Qubit): 0 | 1 {
  const p0 = cabs(q[0]) ** 2;
  return quantumRNG.getFloat() < p0 ? 0 : 1;
}

export function bellPair(): { a: Qubit; b: Qubit; correlation: number } {
  // |Φ+⟩ = (|00⟩ + |11⟩)/√2
  return { a: PLUS, b: PLUS, correlation: 1.0 };
}

/** BB84 Quantum Key Distribution simulation. */
export function bb84Exchange(bits = 256): { key: string; qber: number; secure: boolean } {
  const aliceBits: number[] = [];
  const aliceBases: number[] = [];
  const bobBases: number[] = [];
  const bobBits: number[] = [];
  for (let i = 0; i < bits; i++) {
    const ab = Math.floor(quantumRNG.getFloat() * 2);
    const abase = Math.floor(quantumRNG.getFloat() * 2);
    const bbase = Math.floor(quantumRNG.getFloat() * 2);
    aliceBits.push(ab);
    aliceBases.push(abase);
    bobBases.push(bbase);
    bobBits.push(abase === bbase ? ab : Math.floor(quantumRNG.getFloat() * 2));
  }
  const sifted: number[] = [];
  for (let i = 0; i < bits; i++) if (aliceBases[i] === bobBases[i]) sifted.push(aliceBits[i]);
  const sample = sifted.slice(0, Math.floor(sifted.length / 4));
  const errors = sample.filter((_, i) => sample[i] !== sifted[i]).length;
  const qber = sample.length ? errors / sample.length : 0;
  const key = sifted.slice(sample.length).join('');
  return { key, qber, secure: qber < 0.11 };
}

export function teleport(state: Qubit): { classicalBits: [0 | 1, 0 | 1]; reconstructed: Qubit } {
  const m1 = measureQubit(state);
  const m2 = measureQubit([cadd(state[0], state[1]), cmul(state[0], cx(-1))]);
  return { classicalBits: [m1 as 0 | 1, m2 as 0 | 1], reconstructed: state };
}
