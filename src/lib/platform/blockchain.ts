/**
 * SellSpark On-Chain Commerce Bridge
 * Lightweight blockchain-adjacent primitives: NFT minting receipts,
 * verifiable credentials, smart-contract-style escrow state machines,
 * Merkle proofs for creator revenue attestations, and token-gated drops.
 */

import { createHash, randomUUID } from 'crypto';

export type Address = `0x${string}`;

export interface Receipt {
  id: string;
  owner: Address;
  tokenId: string;
  contentHash: string;
  mintedAt: number;
  chain: 'SellSparkL2' | 'Base' | 'Polygon' | 'Solana';
  metadata: Record<string, unknown>;
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function mintReceipt(
  owner: Address,
  content: string,
  chain: Receipt['chain'] = 'SellSparkL2',
  metadata: Record<string, unknown> = {},
): Receipt {
  const tokenId = sha256(`${owner}:${content}:${Date.now()}`).slice(0, 32);
  return {
    id: randomUUID(),
    owner,
    tokenId,
    contentHash: sha256(content),
    mintedAt: Date.now(),
    chain,
    metadata,
  };
}

// Merkle tree for revenue attestations -----------------------------------
export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256('');
  let layer = leaves.map(sha256);
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const a = layer[i];
      const b = layer[i + 1] ?? a;
      next.push(sha256(a + b));
    }
    layer = next;
  }
  return layer[0];
}

export function merkleProof(leaves: string[], index: number): string[] {
  const proof: string[] = [];
  let layer = leaves.map(sha256);
  let idx = index;
  while (layer.length > 1) {
    const sibling = idx ^ 1;
    proof.push(layer[sibling] ?? layer[idx]);
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      next.push(sha256(layer[i] + (layer[i + 1] ?? layer[i])));
    }
    layer = next;
    idx = Math.floor(idx / 2);
  }
  return proof;
}

// Escrow state machine ---------------------------------------------------
export type EscrowState = 'pending' | 'funded' | 'delivered' | 'released' | 'disputed' | 'refunded';

export interface Escrow {
  id: string;
  buyer: Address;
  creator: Address;
  amount: number;
  state: EscrowState;
  history: { at: number; from: EscrowState; to: EscrowState; actor: Address }[];
}

export function transition(e: Escrow, to: EscrowState, actor: Address): Escrow {
  const allowed: Record<EscrowState, EscrowState[]> = {
    pending: ['funded', 'refunded'],
    funded: ['delivered', 'disputed', 'refunded'],
    delivered: ['released', 'disputed'],
    released: [],
    disputed: ['released', 'refunded'],
    refunded: [],
  };
  if (!allowed[e.state].includes(to)) {
    throw new Error(`Invalid escrow transition: ${e.state} → ${to}`);
  }
  return {
    ...e,
    state: to,
    history: [...e.history, { at: Date.now(), from: e.state, to, actor }],
  };
}

// Token-gated access -----------------------------------------------------
export interface TokenGate {
  contract: Address;
  minBalance: number;
  chain: Receipt['chain'];
}

export function verifyTokenGate(
  wallet: Address,
  gate: TokenGate,
  balance: number,
): { granted: boolean; reason: string } {
  if (balance >= gate.minBalance) {
    return { granted: true, reason: `Holds ${balance} ≥ ${gate.minBalance} on ${gate.chain}` };
  }
  return { granted: false, reason: `Wallet ${wallet} holds ${balance}, needs ${gate.minBalance}` };
}
