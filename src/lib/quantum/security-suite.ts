/**
 * Quantum Security Suite
 *
 * Expanded quantum security primitives:
 * - Quantum Key Distribution (QKD) simulation
 * - Post-quantum certificates
 * - Quantum random oracle
 * - Threat detection
 * - Zero-knowledge proof engine
 * - Crypto agility registry
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomBytes(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 256));
}

function randomBits(n: number): number[] {
  return Array.from({ length: n }, () => Math.round(Math.random()));
}

function hexOf(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function pseudoHash(input: string, salt: string): string {
  let h = 0x811c9dc5;
  const str = input + salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  // Expand to 64 hex chars
  let out = '';
  let seed = h;
  while (out.length < 64) {
    seed = (Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0);
    out += seed.toString(16).padStart(8, '0');
  }
  return out.slice(0, 64);
}

// ─── Quantum Key Distribution ─────────────────────────────────────────────────

export type QKDProtocol = 'BB84' | 'E91' | 'B92';

export interface QKDSession {
  sessionId: string;
  aliceKey: number[];
  bobKey: number[];
  errorRate: number;
  siftedKeyLength: number;
  secretKeyRate: number; // bits per second
  protocol: QKDProtocol;
}

/**
 * Simulate BB84 QKD protocol.
 * Alice sends random bits with random bases; Bob measures with random bases.
 * Sifted key = bits where bases match. Eve causes 25% QBER on intercepted bits.
 */
export function simulateBB84(keyLength: number): QKDSession {
  const aliceBits = randomBits(keyLength);
  const aliceBases = randomBits(keyLength); // 0 = rectilinear, 1 = diagonal
  const bobBases = randomBits(keyLength);

  // Eve intercepts ~25% of qubits, introducing errors
  const eveIntercept = randomBits(keyLength).map((b) => b === 1 && Math.random() < 0.25);

  const siftedAlice: number[] = [];
  const siftedBob: number[] = [];

  for (let i = 0; i < keyLength; i++) {
    if (aliceBases[i] === bobBases[i]) {
      siftedAlice.push(aliceBits[i]);
      // If Eve intercepted, 50% chance of error in Bob's measurement
      const bit = eveIntercept[i] ? (Math.random() < 0.5 ? aliceBits[i] ^ 1 : aliceBits[i]) : aliceBits[i];
      siftedBob.push(bit);
    }
  }

  const errors = siftedAlice.filter((b, i) => b !== siftedBob[i]).length;
  const errorRate = siftedAlice.length > 0 ? errors / siftedAlice.length : 0;
  const secretKeyRate = computeSecretKeyRate(siftedAlice.length, errorRate);

  return {
    sessionId: hexOf(randomBytes(8)),
    aliceKey: siftedAlice,
    bobKey: siftedBob,
    errorRate: parseFloat(errorRate.toFixed(4)),
    siftedKeyLength: siftedAlice.length,
    secretKeyRate,
    protocol: 'BB84',
  };
}

/**
 * Compute secret key rate after privacy amplification (simplified Devetak–Winter).
 * Returns bits per second (assumes 1 GHz clock for the simulation).
 */
export function computeSecretKeyRate(rawLength: number, errorRate: number): number {
  // Binary entropy
  const h = (p: number) =>
    p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  // Secret fraction = 1 - h(e) - h(e) per Devetak-Winter lower bound
  const secretFraction = Math.max(0, 1 - 2 * h(errorRate));
  // Simulate 1 GHz clock → rawLength bits in rawLength ns; scale to bps
  const bps = secretFraction * rawLength * 1e9;
  return parseFloat(bps.toFixed(0));
}

// ─── Post-Quantum Certificates ───────────────────────────────────────────────

export type PQAlgorithm = 'ML-KEM-768' | 'ML-DSA-65' | 'SLH-DSA' | 'CRYSTALS-Kyber' | 'CRYSTALS-Dilithium' | 'FALCON-512';

export interface PQCertificate {
  certId: string;
  subject: string;
  issuer: string;
  publicKey: string;
  algorithm: PQAlgorithm;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  extensions: string[];
}

export function generatePQCertificate(subject: string, algorithm: PQAlgorithm): PQCertificate {
  const now = new Date();
  const validTo = new Date(now);
  validTo.setFullYear(validTo.getFullYear() + 2);

  const certId = hexOf(randomBytes(8));
  const pubKeyBytes = randomBytes(64);
  const publicKey = hexOf(pubKeyBytes);
  const fingerprint = pseudoHash(publicKey, certId);

  return {
    certId,
    subject,
    issuer: 'SellSpark Root CA (PQC)',
    publicKey,
    algorithm,
    validFrom: now.toISOString(),
    validTo: validTo.toISOString(),
    fingerprint,
    extensions: [
      'keyUsage: digitalSignature, keyEncipherment',
      'extKeyUsage: serverAuth, clientAuth',
      'subjectAltName: DNS:' + subject,
      'quantumSafe: true',
      'pqcLevel: NIST-Level-3',
    ],
  };
}

export function verifyCertificateChain(
  cert: PQCertificate,
  ca: PQCertificate
): { valid: boolean; reason: string } {
  const now = new Date();
  const certFrom = new Date(cert.validFrom);
  const certTo = new Date(cert.validTo);
  const caTo = new Date(ca.validTo);

  if (now < certFrom) return { valid: false, reason: 'Certificate not yet valid' };
  if (now > certTo) return { valid: false, reason: 'Certificate expired' };
  if (now > caTo) return { valid: false, reason: 'Issuing CA certificate expired' };
  if (cert.issuer !== ca.subject && cert.issuer !== 'SellSpark Root CA (PQC)') {
    return { valid: false, reason: 'Issuer mismatch' };
  }
  if (cert.algorithm !== ca.algorithm) {
    return { valid: false, reason: 'Algorithm mismatch between cert and CA' };
  }
  return { valid: true, reason: 'Certificate chain valid' };
}

// ─── Quantum Random Oracle ────────────────────────────────────────────────────

export type OracleHashAlgorithm = 'SHAKE-256' | 'SHA3-512' | 'BLAKE3';

export interface OracleQuery {
  input: string;
  output: string;
  hashAlgorithm: OracleHashAlgorithm;
  queryTime: number; // ms
}

const oracleCache = new Map<string, string>();

export function queryRandomOracle(input: string, alg: OracleHashAlgorithm): OracleQuery {
  const key = `${alg}:${input}`;
  const t0 = performance.now();

  let output = oracleCache.get(key);
  if (!output) {
    // Simulate hash output deterministically from input
    const salt = alg.replace(/-/g, '').toLowerCase();
    output = pseudoHash(input, salt) + pseudoHash(salt, input);
    oracleCache.set(key, output);
  }

  const queryTime = parseFloat((performance.now() - t0 + Math.random() * 0.5).toFixed(3));
  return { input, output, hashAlgorithm: alg, queryTime };
}

export function buildOracleProof(queries: OracleQuery[]): string {
  // Build a Merkle-like commitment: hash of sorted leaf hashes
  if (queries.length === 0) return '0'.repeat(64);
  let leaves = queries.map((q) => pseudoHash(q.input, q.output));
  while (leaves.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = leaves[i + 1] ?? left;
      next.push(pseudoHash(left, right));
    }
    leaves = next;
  }
  return leaves[0];
}

// ─── Threat Detection ─────────────────────────────────────────────────────────

export type QuantumThreatType =
  | 'harvest-now-decrypt-later'
  | 'shor-attack'
  | 'grover-speedup'
  | 'side-channel';

export interface QuantumThreat {
  threatId: string;
  type: QuantumThreatType;
  severity: number; // 1–10
  affectedSystems: string[];
  mitigations: string[];
  detectedAt: string;
}

const THREAT_TEMPLATES: Omit<QuantumThreat, 'threatId' | 'detectedAt'>[] = [
  {
    type: 'harvest-now-decrypt-later',
    severity: 9,
    affectedSystems: ['TLS 1.3 sessions', 'RSA-2048 encrypted backups', 'Payment vault'],
    mitigations: [
      'Migrate to ML-KEM-768 for all TLS handshakes',
      'Re-encrypt historical backups with Kyber',
      'Enable forward secrecy via ephemeral PQC keys',
      'Audit data retention policies',
    ],
  },
  {
    type: 'shor-attack',
    severity: 8,
    affectedSystems: ['RSA-4096 signatures', 'ECDSA payment keys', 'OAuth token signing'],
    mitigations: [
      'Replace RSA/ECDSA with ML-DSA-65',
      'Rotate signing keys to SLH-DSA',
      'Implement hybrid classical + PQC signatures',
      'Update PKI trust anchors',
    ],
  },
  {
    type: 'grover-speedup',
    severity: 5,
    affectedSystems: ['AES-128 symmetric keys', 'HMAC-SHA256 MACs', 'Session tokens'],
    mitigations: [
      'Upgrade symmetric keys from 128-bit to 256-bit',
      'Use AES-256-GCM for all bulk encryption',
      'Increase HMAC key length to 512 bits',
    ],
  },
  {
    type: 'side-channel',
    severity: 6,
    affectedSystems: ['Lattice sampler timing', 'Key generation routines', 'NTT transforms'],
    mitigations: [
      'Apply constant-time NTT implementation',
      'Add cache-timing mitigations in crypto lib',
      'Enable hardware AES acceleration',
      'Use masking countermeasures in Kyber decaps',
    ],
  },
];

export function scanForThreats(_systemConfig?: Record<string, unknown>): QuantumThreat[] {
  return THREAT_TEMPLATES.map((t) => ({
    ...t,
    threatId: hexOf(randomBytes(6)),
    detectedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
  }));
}

export function computeQuantumRisk(threats: QuantumThreat[]): number {
  if (threats.length === 0) return 0;
  // Weighted average severity × coverage factor
  const maxSeverity = Math.max(...threats.map((t) => t.severity));
  const avgSeverity = threats.reduce((s, t) => s + t.severity, 0) / threats.length;
  // Scale: maxSeverity drives 60%, avg drives 40%, normalised to 0–100
  const raw = (maxSeverity * 0.6 + avgSeverity * 0.4) * 10;
  return Math.min(100, Math.round(raw));
}

// ─── Zero-Knowledge Proof Engine ─────────────────────────────────────────────

export interface ZKProof {
  proofId: string;
  statement: string;
  witness: string;
  commitment: string;
  challenge: string;
  response: string;
  verified: boolean;
}

export function createZKProof(statement: string, secret: string): ZKProof {
  const proofId = hexOf(randomBytes(8));
  // Simulate Schnorr-style sigma protocol
  const r = hexOf(randomBytes(32)); // random nonce
  const commitment = pseudoHash(r, statement);
  const challenge = pseudoHash(commitment, statement + proofId);
  // response = r XOR (challenge & witness_hash) — simulated
  const witnessHash = pseudoHash(secret, proofId);
  const respBytes = Array.from({ length: 32 }, (_, i) => {
    const c = parseInt(challenge.slice(i * 2, i * 2 + 2), 16);
    const w = parseInt(witnessHash.slice(i * 2, i * 2 + 2), 16);
    const rv = parseInt(r.slice(i * 2, i * 2 + 2), 16);
    return rv ^ (c & w);
  });
  const response = hexOf(respBytes);

  return {
    proofId,
    statement,
    witness: witnessHash,
    commitment,
    challenge,
    response,
    verified: false, // must call verifyZKProof
  };
}

export function verifyZKProof(proof: ZKProof): boolean {
  // Recompute challenge from commitment + statement + proofId
  const expectedChallenge = pseudoHash(proof.commitment, proof.statement + proof.proofId);
  return expectedChallenge === proof.challenge && proof.commitment.length === 64;
}

export function generateZKIdentityProof(userId: string): ZKProof {
  const statement = `User ${userId} possesses valid SellSpark credentials`;
  const secret = pseudoHash(userId, 'identity-secret-' + Date.now().toString());
  const proof = createZKProof(statement, secret);
  proof.verified = verifyZKProof(proof);
  return proof;
}

// ─── Crypto Agility Registry ──────────────────────────────────────────────────

export type CryptoAlgorithmType = 'KEM' | 'Signature' | 'Hash' | 'Symmetric' | 'MAC' | 'KDF';

export interface CryptoAlgorithm {
  name: string;
  type: CryptoAlgorithmType;
  keySize: number; // bits
  quantumSafe: boolean;
  deprecated: boolean;
  replacedBy?: string;
}

export const ALGORITHM_REGISTRY: CryptoAlgorithm[] = [
  { name: 'ML-KEM-768', type: 'KEM', keySize: 768, quantumSafe: true, deprecated: false },
  { name: 'ML-DSA-65', type: 'Signature', keySize: 2000, quantumSafe: true, deprecated: false },
  { name: 'SLH-DSA', type: 'Signature', keySize: 256, quantumSafe: true, deprecated: false },
  { name: 'FALCON-512', type: 'Signature', keySize: 512, quantumSafe: true, deprecated: false },
  { name: 'AES-256-GCM', type: 'Symmetric', keySize: 256, quantumSafe: true, deprecated: false },
  { name: 'SHA3-512', type: 'Hash', keySize: 512, quantumSafe: true, deprecated: false },
  { name: 'BLAKE3', type: 'Hash', keySize: 256, quantumSafe: true, deprecated: false },
  { name: 'SHAKE-256', type: 'Hash', keySize: 256, quantumSafe: true, deprecated: false },
  { name: 'RSA-2048', type: 'KEM', keySize: 2048, quantumSafe: false, deprecated: true, replacedBy: 'ML-KEM-768' },
  { name: 'ECDSA-P256', type: 'Signature', keySize: 256, quantumSafe: false, deprecated: true, replacedBy: 'ML-DSA-65' },
  { name: 'AES-128-CBC', type: 'Symmetric', keySize: 128, quantumSafe: false, deprecated: true, replacedBy: 'AES-256-GCM' },
  { name: 'SHA-256', type: 'Hash', keySize: 256, quantumSafe: false, deprecated: true, replacedBy: 'SHA3-512' },
];

export interface CryptoAgilityReport {
  safe: CryptoAlgorithm[];
  deprecated: CryptoAlgorithm[];
  migrationRequired: { from: string; to: string }[];
}

export function assessCryptoAgility(algorithms: CryptoAlgorithm[]): CryptoAgilityReport {
  const safe = algorithms.filter((a) => a.quantumSafe && !a.deprecated);
  const deprecated = algorithms.filter((a) => a.deprecated);
  const migrationRequired = deprecated
    .filter((a) => a.replacedBy)
    .map((a) => ({ from: a.name, to: a.replacedBy! }));
  return { safe, deprecated, migrationRequired };
}
