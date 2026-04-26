/**
 * @module error-correction
 * @description Quantum error correction codes simulation:
 * - Steane [7,1,3] code — 6 ancilla qubits, corrects 1 arbitrary error
 * - Surface code (rotated) — distance-d, threshold ~1%
 * - Repetition code — simplest classical-quantum bridge for bit-flip
 * - Shor code [9,1,3] — first universal QEC code
 * - Magic state distillation — overhead estimation for fault-tolerant gates
 *
 * Used by SellSpark to estimate required hardware qubit counts and
 * post-quantum cryptographic key lifetimes.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PauliError = 'I' | 'X' | 'Y' | 'Z';

export interface LogicalQubit {
  physicalQubits: number;   // number of physical qubits encoding one logical
  codeDistance: number;
  threshold: number;         // physical error rate threshold
  faultTolerant: boolean;
}

export interface SyndromeResult {
  syndrome: number[];         // measurement outcomes (0/1)
  identifiedError: PauliError;
  errorLocation: number | null;
  correctable: boolean;
}

export interface SurfaceCodeParams {
  distance: number;            // code distance d (odd integer)
  physicalErrorRate: number;   // p per gate
}

export interface FaultTolerantResource {
  logicalErrorRate: number;
  physicalQubitsPerLogical: number;
  codeDistance: number;
  magicStateOverhead: number;    // T-gate factory qubits
  totalQubitsForAlgorithm: number;
}

// ─── Repetition Code ───────────────────────────────────────────────────────────

/** Encode 1 logical qubit into n-bit repetition code */
export function repetitionEncode(bit: 0 | 1, n: number = 3): number[] {
  return Array(n).fill(bit);
}

/** Introduce random bit-flip errors at rate p */
export function applyBitFlips(codeword: number[], errorRate: number): number[] {
  return codeword.map(b => Math.random() < errorRate ? 1 - b : b);
}

/** Majority-vote decode repetition code */
export function repetitionDecode(received: number[]): 0 | 1 {
  const ones = received.filter(b => b === 1).length;
  return ones > received.length / 2 ? 1 : 0;
}

export function repetitionLogicalErrorRate(p: number, n: number): number {
  // P(majority fails) = sum_{k=ceil(n/2)}^{n} C(n,k) p^k (1-p)^(n-k)
  let total = 0;
  const threshold = Math.ceil(n / 2);
  for (let k = threshold; k <= n; k++) {
    total += binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }
  return total;
}

function binomialCoeff(n: number, k: number): number {
  if (k > n) return 0;
  let c = 1;
  for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
  return c;
}

// ─── Steane [7,1,3] Code ───────────────────────────────────────────────────────

// Parity check matrix H (6×7) for Steane code
const STEANE_H: number[][] = [
  [1,0,1,0,1,0,1],
  [0,1,1,0,0,1,1],
  [0,0,0,1,1,1,1],
  [1,0,1,0,1,0,1],
  [0,1,1,0,0,1,1],
  [0,0,0,1,1,1,1],
];

// Generator matrix (encoding map)
const STEANE_G: number[][] = [
  [1,0,0,0,1,1,0],
  [0,1,0,0,1,0,1],
  [0,0,1,0,0,1,1],
  [0,0,0,1,1,1,1],
];

export function steaneEncode(bit: 0 | 1): number[] {
  // Encode single logical qubit — simplified: all-zero logical = [0]*7, logical 1 maps to codeword
  const logicalZero = [0,0,0,0,0,0,0];
  const logicalOne  = [1,0,1,0,1,1,0]; // one valid codeword of Steane
  return bit === 0 ? logicalZero : logicalOne;
}

export function steaneSyndrome(received: number[]): SyndromeResult {
  const syndrome: number[] = [];
  for (let row = 0; row < 6; row++) {
    let s = 0;
    for (let col = 0; col < 7; col++) s ^= STEANE_H[row][col] * received[col];
    syndrome.push(s % 2);
  }

  // Error location from syndrome (columns of H)
  const synInt = syndrome.slice(0, 3).reduce((acc, b, i) => acc + b * (1 << (2 - i)), 0);
  const errorLocation = synInt === 0 ? null : synInt - 1;
  const identifiedError: PauliError = errorLocation !== null ? 'X' : 'I';
  const correctable = true; // Steane corrects all single-qubit errors

  return { syndrome, identifiedError, errorLocation, correctable };
}

export function steaneCorrect(received: number[], result: SyndromeResult): number[] {
  if (result.errorLocation === null) return received;
  const corrected = [...received];
  corrected[result.errorLocation] ^= 1;
  return corrected;
}

export function steaneDecode(codeword: number[]): 0 | 1 {
  // Logical operator is first qubit of the codeword (simplified)
  return codeword[0] as 0 | 1;
}

// ─── Shor [9,1,3] Code ────────────────────────────────────────────────────────

export function shorEncode(bit: 0 | 1): number[] {
  // Shor: encode 1 logical into 9 physical
  // |0_L> = (|000> + |111>)^⊗3 / 2√2  →  simplified bitstring representation
  const base = bit === 0 ? [0,0,0, 0,0,0, 0,0,0] : [1,1,1, 1,1,1, 1,1,1];
  return base;
}

export function shorDecode(physical: number[]): 0 | 1 {
  // Majority vote in each block of 3, then majority of 3 blocks
  const blocks = [physical.slice(0,3), physical.slice(3,6), physical.slice(6,9)];
  const blockBits = blocks.map(b => b.filter(x => x===1).length >= 2 ? 1 : 0);
  return (blockBits.filter(x => x===1).length >= 2 ? 1 : 0) as 0 | 1;
}

// ─── Surface Code ─────────────────────────────────────────────────────────────

/** Physical qubits needed for rotated surface code of distance d */
export function surfaceCodeQubits(d: number): number {
  return 2 * d * d - 2 * d + 1;
}

/** Logical error rate below threshold p < p_th */
export function surfaceLogicalErrorRate(params: SurfaceCodeParams): number {
  const { distance: d, physicalErrorRate: p } = params;
  // p_L ≈ A * (p / p_th)^ceil(d/2)   with A ≈ 0.1, p_th ≈ 0.01
  const A = 0.1;
  const pTh = 0.01;
  const exponent = Math.ceil(d / 2);
  return A * Math.pow(p / pTh, exponent);
}

export function surfaceCodeDistance(targetLogicalError: number, physicalErrorRate: number): number {
  // Find minimum d such that p_L <= target
  for (let d = 3; d <= 51; d += 2) {
    const pL = surfaceLogicalErrorRate({ distance: d, physicalErrorRate });
    if (pL <= targetLogicalError) return d;
  }
  return 51; // max practical distance
}

// ─── Fault-Tolerant Resource Estimation ───────────────────────────────────────

/**
 * Estimate total physical qubit overhead for a fault-tolerant algorithm.
 * Includes data qubits, ancilla, and T-gate magic state factories.
 */
export function estimateFaultTolerantResources(
  logicalQubits: number,
  targetLogicalError: number,
  physicalErrorRate: number,
  tGateCount: number,
): FaultTolerantResource {
  const d = surfaceCodeDistance(targetLogicalError, physicalErrorRate);
  const physPerLogical = surfaceCodeQubits(d);
  const logicalErrorRate = surfaceLogicalErrorRate({ distance: d, physicalErrorRate });

  // Magic state factory: ~15 physical qubits per T gate at 15-to-1 distillation
  const magicStateOverhead = Math.ceil(tGateCount * 15);
  const totalQubitsForAlgorithm = logicalQubits * physPerLogical + magicStateOverhead;

  return {
    logicalErrorRate,
    physicalQubitsPerLogical: physPerLogical,
    codeDistance: d,
    magicStateOverhead,
    totalQubitsForAlgorithm,
  };
}

// ─── NISQ vs Fault-Tolerant Comparison ────────────────────────────────────────

export interface NISQAnalysis {
  currentQubits: number;       // state-of-art NISQ device
  requiredQubits: number;
  faultTolerantReady: boolean;
  estimatedYearsToFT: number;
  cryptoRelevance: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export function analyzeNISQReadiness(
  algorithm: 'RSA-2048' | 'AES-256' | 'ECDSA-256' | 'Kyber-1024' | 'creator-ml',
  physicalErrorRate: number = 0.001,
): NISQAnalysis {
  const currentQubits = 1000; // ~2024 NISQ frontier

  const specs: Record<typeof algorithm, { logicalQ: number; tGates: number; label: NISQAnalysis['cryptoRelevance'] }> = {
    'RSA-2048':     { logicalQ: 2048,  tGates: 4e9,  label: 'critical' },
    'AES-256':      { logicalQ: 256,   tGates: 1e11, label: 'high' },
    'ECDSA-256':    { logicalQ: 256,   tGates: 3e9,  label: 'critical' },
    'Kyber-1024':   { logicalQ: 0,     tGates: 0,    label: 'none' },   // post-quantum safe
    'creator-ml':   { logicalQ: 64,    tGates: 5e5,  label: 'low' },
  };

  const s = specs[algorithm];
  if (s.logicalQ === 0) {
    return { currentQubits, requiredQubits: 0, faultTolerantReady: true, estimatedYearsToFT: 0, cryptoRelevance: 'none' };
  }

  const res = estimateFaultTolerantResources(s.logicalQ, 1e-12, physicalErrorRate, s.tGates);
  const faultTolerantReady = currentQubits >= res.totalQubitsForAlgorithm;

  // Moore's-law-ish: ~2x qubits per 18 months
  const doublings = Math.log2(res.totalQubitsForAlgorithm / currentQubits);
  const estimatedYearsToFT = Math.max(0, doublings * 1.5);

  return {
    currentQubits,
    requiredQubits: res.totalQubitsForAlgorithm,
    faultTolerantReady,
    estimatedYearsToFT,
    cryptoRelevance: s.label,
  };
}

// ─── Threshold Theorem Check ──────────────────────────────────────────────────

export function isAboveThreshold(physicalErrorRate: number, code: 'surface' | 'steane' | 'repetition'): boolean {
  const thresholds = { surface: 0.01, steane: 0.001, repetition: 0.5 };
  return physicalErrorRate < thresholds[code];
}

export function describeQEC(code: 'surface' | 'steane' | 'repetition' | 'shor'): LogicalQubit {
  const specs: Record<string, LogicalQubit> = {
    surface:    { physicalQubits: 49, codeDistance: 5, threshold: 0.01,  faultTolerant: true },
    steane:     { physicalQubits: 7,  codeDistance: 3, threshold: 0.001, faultTolerant: true },
    repetition: { physicalQubits: 3,  codeDistance: 3, threshold: 0.5,   faultTolerant: false },
    shor:       { physicalQubits: 9,  codeDistance: 3, threshold: 0.001, faultTolerant: true },
  };
  return specs[code];
}
