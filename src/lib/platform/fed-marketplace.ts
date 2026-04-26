/**
 * SellSpark Federated Marketplace Protocol
 * ActivityPub-compatible federation so SellSpark creators can be
 * discovered/followed from any Fediverse app (Mastodon, PeerTube,
 * Bluesky AT Proto bridge).
 */

export interface ActivityPubActor {
  '@context': string[];
  type: 'Person';
  id: string;
  preferredUsername: string;
  name: string;
  summary: string;
  inbox: string;
  outbox: string;
  publicKey: { id: string; owner: string; publicKeyPem: string };
}

export function buildActor(username: string, displayName: string, bio: string, pubKey: string, base: string): ActivityPubActor {
  return {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
    type: 'Person',
    id: `${base}/@${username}`,
    preferredUsername: username,
    name: displayName,
    summary: bio,
    inbox: `${base}/@${username}/inbox`,
    outbox: `${base}/@${username}/outbox`,
    publicKey: { id: `${base}/@${username}#main-key`, owner: `${base}/@${username}`, publicKeyPem: pubKey },
  };
}

export function webfinger(username: string, base: string) {
  return {
    subject: `acct:${username}@${new URL(base).host}`,
    links: [{ rel: 'self', type: 'application/activity+json', href: `${base}/@${username}` }],
  };
}
