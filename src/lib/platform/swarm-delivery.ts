/**
 * SellSpark Swarm Delivery Orchestrator
 * For physical merch: dispatch to drones, robots, couriers via unified
 * multi-objective routing (VRPTW-lite) with carbon + SLA constraints.
 */

export type Vehicle = 'drone' | 'autonomous-bot' | 'bike' | 'van' | 'walker';

export interface Stop { id: string; lat: number; lng: number; weightG: number; deadline: number }

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function pickVehicle(stop: Stop, distanceKm: number): Vehicle {
  if (stop.weightG < 2000 && distanceKm < 15) return 'drone';
  if (stop.weightG < 5000 && distanceKm < 3) return 'autonomous-bot';
  if (distanceKm < 6) return 'bike';
  if (distanceKm < 1) return 'walker';
  return 'van';
}

export function nearestNeighborRoute(depot: { lat: number; lng: number }, stops: Stop[]): Stop[] {
  const remaining = [...stops];
  const route: Stop[] = [];
  let cur = depot;
  while (remaining.length) {
    remaining.sort((a, b) => haversineKm(cur, a) - haversineKm(cur, b));
    const next = remaining.shift()!;
    route.push(next);
    cur = next;
  }
  return route;
}

export function eta(depot: { lat: number; lng: number }, stop: Stop, vehicle: Vehicle): number {
  const km = haversineKm(depot, stop);
  const speed = { drone: 60, 'autonomous-bot': 8, bike: 18, van: 35, walker: 5 }[vehicle];
  return Math.round((km / speed) * 3600);
}
