/**
 * SellSpark Creator Knowledge Graph
 * Entity extraction, triple store, SPARQL-lite queries, and
 * embedding-backed semantic traversal for creator discovery.
 */

export interface Triple { s: string; p: string; o: string }

export class KnowledgeGraph {
  private triples: Triple[] = [];
  add(t: Triple) { this.triples.push(t); }
  query(pattern: Partial<Triple>): Triple[] {
    return this.triples.filter((t) =>
      (!pattern.s || t.s === pattern.s) &&
      (!pattern.p || t.p === pattern.p) &&
      (!pattern.o || t.o === pattern.o),
    );
  }
  neighbors(entity: string, depth = 1): Set<string> {
    const seen = new Set<string>([entity]);
    let frontier = [entity];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      frontier.forEach((e) => {
        this.triples.forEach((t) => {
          if (t.s === e && !seen.has(t.o)) { seen.add(t.o); next.push(t.o); }
          if (t.o === e && !seen.has(t.s)) { seen.add(t.s); next.push(t.s); }
        });
      });
      frontier = next;
    }
    return seen;
  }
  toJSON(): Triple[] { return [...this.triples]; }
}

export function extractEntities(text: string): { name: string; type: 'Person' | 'Org' | 'Product' | 'Topic' }[] {
  const entities: { name: string; type: 'Person' | 'Org' | 'Product' | 'Topic' }[] = [];
  const persons = text.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g) || [];
  persons.forEach((n) => entities.push({ name: n, type: 'Person' }));
  const hash = text.match(/#([a-z0-9]+)/gi) || [];
  hash.forEach((h) => entities.push({ name: h.slice(1), type: 'Topic' }));
  return entities;
}
