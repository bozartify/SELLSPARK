/**
 * SellSpark Live Auctions & Dynamic Pricing
 * English/Dutch/sealed-bid/Vickrey auctions, anti-sniping extension,
 * proxy bidding, and AI reserve-price suggestions.
 */

export type AuctionKind = 'english' | 'dutch' | 'sealed' | 'vickrey';

export interface Bid { bidder: string; amount: number; at: number; proxy?: number }

export interface Auction {
  id: string;
  kind: AuctionKind;
  productId: string;
  reserve: number;
  currentPrice: number;
  minIncrement: number;
  endsAt: number;
  bids: Bid[];
  antiSnipeSeconds: number;
}

export function placeBid(a: Auction, bid: Bid): { accepted: boolean; reason: string; auction: Auction } {
  if (Date.now() > a.endsAt) return { accepted: false, reason: 'Auction ended', auction: a };
  if (bid.amount < a.currentPrice + a.minIncrement) return { accepted: false, reason: 'Below minimum increment', auction: a };
  const endsAt = a.endsAt - Date.now() < a.antiSnipeSeconds * 1000 ? Date.now() + a.antiSnipeSeconds * 1000 : a.endsAt;
  return {
    accepted: true,
    reason: 'OK',
    auction: { ...a, currentPrice: bid.amount, bids: [...a.bids, bid], endsAt },
  };
}

export function resolveAuction(a: Auction): { winner: string | null; pays: number } {
  if (a.bids.length === 0 || a.currentPrice < a.reserve) return { winner: null, pays: 0 };
  const sorted = [...a.bids].sort((x, y) => y.amount - x.amount);
  if (a.kind === 'vickrey') return { winner: sorted[0].bidder, pays: sorted[1]?.amount ?? a.reserve };
  return { winner: sorted[0].bidder, pays: sorted[0].amount };
}

export function suggestReserve(recentSalesUsd: number[]): number {
  if (!recentSalesUsd.length) return 1;
  const median = [...recentSalesUsd].sort((a, b) => a - b)[Math.floor(recentSalesUsd.length / 2)];
  return Math.max(1, Math.round(median * 0.7));
}
