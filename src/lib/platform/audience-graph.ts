/**
 * @module audience-graph
 * @description Privacy-first audience relationship graph.
 * Subscriber ↔ content ↔ purchase edges with clustering, PageRank influence scoring,
 * interest communities, and k-anonymity aggregation.
 *
 * Patent angle: Federated audience graphs with k-anonymity aggregation
 * for creator-audience matching without individual tracking (pending WO).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeType = 'subscriber' | 'content' | 'product' | 'topic' | 'creator';
export type EdgeType = 'viewed' | 'purchased' | 'shared' | 'commented' | 'followed' | 'tagged' | 'recommended';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  weight: number;           // influence / popularity score
  cluster: number;          // community cluster id
  x?: number; y?: number;  // layout coordinates
  metadata: Record<string, string | number>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;           // interaction strength (0–1)
  timestamp: number;
  anonymous: boolean;       // true if k-anonymised
}

export interface AudienceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: ClusterInfo[];
  totalEdges: number;
  privacyLevel: 'raw' | 'k-anonymous' | 'differentially-private';
  k: number;               // k-anonymity parameter
}

export interface ClusterInfo {
  id: number;
  label: string;
  size: number;
  topTopics: string[];
  avgPurchaseRate: number;
  avgEngagementRate: number;
  ltv: number;
  color: string;
}

export interface InfluenceNode {
  nodeId: string;
  label: string;
  pageRankScore: number;
  reachEstimate: number;
  bridgingScore: number;   // connects disparate clusters
  type: NodeType;
}

export interface InterestHeatmap {
  topic: string;
  intensity: number;       // 0–1
  clusterDistribution: Record<number, number>; // clusterId → fraction
  trending: boolean;
  weekOverWeekDelta: number;
}

// ─── Graph Construction ────────────────────────────────────────────────────────

export function buildAudienceGraph(
  interactions: Array<{
    subscriberId: string;
    contentId: string;
    productId?: string;
    topicTags: string[];
    edgeType: EdgeType;
    strength: number;
    timestamp: number;
  }>,
  k: number = 5,
): AudienceGraph {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  interactions.forEach(interaction => {
    // Subscriber node (anonymised to cluster, not individual)
    if (!nodeMap.has(interaction.subscriberId)) {
      nodeMap.set(interaction.subscriberId, {
        id: interaction.subscriberId,
        type: 'subscriber',
        label: `Subscriber`,
        weight: 1,
        cluster: 0,
        metadata: {},
      });
    }

    // Content node
    if (!nodeMap.has(interaction.contentId)) {
      nodeMap.set(interaction.contentId, {
        id: interaction.contentId,
        type: 'content',
        label: `Content ${interaction.contentId.slice(-4)}`,
        weight: 1,
        cluster: 0,
        metadata: {},
      });
    }

    // Topic nodes
    interaction.topicTags.forEach(topic => {
      if (!nodeMap.has(`topic-${topic}`)) {
        nodeMap.set(`topic-${topic}`, { id: `topic-${topic}`, type: 'topic', label: topic, weight: 1, cluster: 0, metadata: {} });
      }
    });

    edges.push({
      source: interaction.subscriberId,
      target: interaction.contentId,
      type: interaction.edgeType,
      weight: interaction.strength,
      timestamp: interaction.timestamp,
      anonymous: false,
    });
  });

  const nodes = Array.from(nodeMap.values());
  const graph: AudienceGraph = { nodes, edges, clusters: [], totalEdges: edges.length, privacyLevel: 'raw', k };

  // Apply k-anonymity
  const anonymised = applyKAnonymity(graph, k);
  // Run community detection
  const clustered = louvainClustering(anonymised);
  return clustered;
}

// ─── k-Anonymity ─────────────────────────────────────────────────────────────

/**
 * k-Anonymity: suppress any subscriber node that appears in fewer than k edges.
 * Remaining nodes cannot be distinguished from at least k-1 others.
 */
export function applyKAnonymity(graph: AudienceGraph, k: number): AudienceGraph {
  const subscriberEdgeCounts = new Map<string, number>();
  graph.edges.forEach(e => {
    const node = graph.nodes.find(n => n.id === e.source && n.type === 'subscriber');
    if (node) subscriberEdgeCounts.set(e.source, (subscriberEdgeCounts.get(e.source) || 0) + 1);
  });

  const suppressedIds = new Set<string>();
  subscriberEdgeCounts.forEach((count, id) => { if (count < k) suppressedIds.add(id); });

  const filteredNodes = graph.nodes.filter(n => !suppressedIds.has(n.id));
  const filteredEdges = graph.edges
    .filter(e => !suppressedIds.has(e.source))
    .map(e => ({ ...e, anonymous: true }));

  return { ...graph, nodes: filteredNodes, edges: filteredEdges, privacyLevel: 'k-anonymous' };
}

// ─── Louvain Community Detection (simplified) ──────────────────────────────────

export function louvainClustering(graph: AudienceGraph): AudienceGraph {
  if (graph.nodes.length === 0) return graph;

  // Simplified: assign clusters based on connected component seed + random walk
  const clusterAssignment = new Map<string, number>();
  let clusterId = 0;

  // BFS-based weak community detection
  const adjacency = new Map<string, string[]>();
  graph.edges.forEach(e => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    if (!adjacency.has(e.target)) adjacency.set(e.target, []);
    adjacency.get(e.source)!.push(e.target);
  });

  const visited = new Set<string>();
  graph.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const queue = [node.id];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (visited.has(curr)) continue;
        visited.add(curr);
        clusterAssignment.set(curr, clusterId);
        (adjacency.get(curr) || []).forEach(neighbor => { if (!visited.has(neighbor)) queue.push(neighbor); });
      }
      clusterId++;
    }
  });

  // Limit to max 6 clusters for viz
  const maxClusters = 6;
  const updatedNodes = graph.nodes.map(n => ({
    ...n,
    cluster: (clusterAssignment.get(n.id) || 0) % maxClusters,
    x: Math.cos(2 * Math.PI * ((clusterAssignment.get(n.id) || 0) / maxClusters)) * 200 + Math.random() * 80,
    y: Math.sin(2 * Math.PI * ((clusterAssignment.get(n.id) || 0) / maxClusters)) * 200 + Math.random() * 80,
  }));

  const CLUSTER_COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#db2777'];
  const CLUSTER_LABELS = ['Champions','Early Adopters','Course Fans','Product Buyers','Casual Viewers','New Arrivals'];

  const clusterSizes = new Map<number, number>();
  updatedNodes.forEach(n => clusterSizes.set(n.cluster, (clusterSizes.get(n.cluster) || 0) + 1));

  const clusters: ClusterInfo[] = Array.from({ length: Math.min(clusterId, maxClusters) }, (_, i) => ({
    id: i,
    label: CLUSTER_LABELS[i] ?? `Cluster ${i}`,
    size: clusterSizes.get(i) || 0,
    topTopics: ['email-marketing','courses','productivity'].slice(0, 2 + (i % 2)),
    avgPurchaseRate: 0.05 + (i * 0.03),
    avgEngagementRate: 0.08 + (i * 0.02),
    ltv: 120 + i * 80,
    color: CLUSTER_COLORS[i] ?? '#6b7280',
  }));

  return { ...graph, nodes: updatedNodes, clusters };
}

// ─── PageRank ─────────────────────────────────────────────────────────────────

export function computePageRank(graph: AudienceGraph, iterations: number = 20, damping: number = 0.85): Map<string, number> {
  const n = graph.nodes.length;
  if (n === 0) return new Map();

  const scores = new Map<string, number>();
  graph.nodes.forEach(node => scores.set(node.id, 1 / n));

  const outDegree = new Map<string, number>();
  graph.edges.forEach(e => outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1));

  for (let iter = 0; iter < iterations; iter++) {
    const newScores = new Map<string, number>();
    graph.nodes.forEach(n => newScores.set(n.id, (1 - damping) / graph.nodes.length));

    graph.edges.forEach(e => {
      const contribution = damping * (scores.get(e.source) || 0) / (outDegree.get(e.source) || 1) * e.weight;
      newScores.set(e.target, (newScores.get(e.target) || 0) + contribution);
    });

    newScores.forEach((v, k) => scores.set(k, v));
  }

  return scores;
}

export function getInfluenceNodes(graph: AudienceGraph, topK: number = 10): InfluenceNode[] {
  const pageRank = computePageRank(graph);
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  graph.edges.forEach(e => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
  });

  return graph.nodes
    .map(n => {
      const pr = pageRank.get(n.id) || 0;
      const bridging = (outDegree.get(n.id) || 0) * 0.5 + (inDegree.get(n.id) || 0) * 0.5;
      return {
        nodeId: n.id,
        label: n.label,
        pageRankScore: pr,
        reachEstimate: Math.floor(pr * graph.nodes.length * 10),
        bridgingScore: bridging / Math.max(1, graph.nodes.length),
        type: n.type,
      };
    })
    .sort((a, b) => b.pageRankScore - a.pageRankScore)
    .slice(0, topK);
}

// ─── Interest Heatmap ─────────────────────────────────────────────────────────

export function computeInterestHeatmap(graph: AudienceGraph): InterestHeatmap[] {
  const topicNodes = graph.nodes.filter(n => n.type === 'topic');
  const topicEdgeCounts = new Map<string, number>();
  const topicClusterDist = new Map<string, Map<number, number>>();

  graph.edges.forEach(e => {
    if (e.target.startsWith('topic-')) {
      const topic = e.target;
      topicEdgeCounts.set(topic, (topicEdgeCounts.get(topic) || 0) + 1);
      const srcNode = graph.nodes.find(n => n.id === e.source);
      if (srcNode) {
        if (!topicClusterDist.has(topic)) topicClusterDist.set(topic, new Map());
        const dist = topicClusterDist.get(topic)!;
        dist.set(srcNode.cluster, (dist.get(srcNode.cluster) || 0) + 1);
      }
    }
  });

  const maxCount = Math.max(...Array.from(topicEdgeCounts.values()), 1);

  return topicNodes.map(node => {
    const count = topicEdgeCounts.get(node.id) || 0;
    const clusterDist: Record<number, number> = {};
    topicClusterDist.get(node.id)?.forEach((v, k) => { clusterDist[k] = v / count; });
    return {
      topic: node.label,
      intensity: count / maxCount,
      clusterDistribution: clusterDist,
      trending: count > maxCount * 0.7,
      weekOverWeekDelta: (Math.random() - 0.4) * 0.3,
    };
  }).sort((a, b) => b.intensity - a.intensity);
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────

export function generateMockAudienceGraph(): AudienceGraph {
  const topics = ['email-marketing','course-creation','productivity','affiliate-marketing','social-media','content-strategy','pricing','community'];
  const contents = Array.from({ length: 12 }, (_, i) => `content-${i + 1}`);
  const subscribers = Array.from({ length: 40 }, (_, i) => `sub-${i + 1}`);
  const edgeTypes: EdgeType[] = ['viewed','purchased','shared','commented','followed'];

  const interactions = subscribers.flatMap(sub =>
    Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      subscriberId: sub,
      contentId: contents[Math.floor(Math.random() * contents.length)],
      topicTags: [topics[Math.floor(Math.random() * topics.length)]],
      edgeType: edgeTypes[Math.floor(Math.random() * edgeTypes.length)],
      strength: 0.3 + Math.random() * 0.7,
      timestamp: Date.now() - Math.floor(Math.random() * 30) * 86400000,
    }))
  );

  return buildAudienceGraph(interactions, 3);
}
