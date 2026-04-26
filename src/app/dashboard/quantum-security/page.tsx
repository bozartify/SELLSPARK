'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  simulateBB84,
  generatePQCertificate,
  verifyCertificateChain,
  scanForThreats,
  computeQuantumRisk,
  createZKProof,
  verifyZKProof,
  type QKDSession,
  type QKDProtocol,
  type PQCertificate,
  type PQAlgorithm,
  type QuantumThreat,
  type ZKProof,
} from '@/lib/quantum/security-suite';

type Tab = 'qkd' | 'certificates' | 'threats' | 'zkp';

// ─── QKD Tab ──────────────────────────────────────────────────────────────────

function QKDTab() {
  const [keyLength, setKeyLength] = useState(256);
  const [protocol, setProtocol] = useState<QKDProtocol>('BB84');
  const [result, setResult] = useState<QKDSession | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSimulate() {
    setLoading(true);
    setTimeout(() => {
      setResult(simulateBB84(keyLength));
      setLoading(false);
    }, 400);
  }

  const errorPct = result ? (result.errorRate * 100).toFixed(2) : null;
  const isLowError = result ? result.errorRate < 0.05 : false;

  return (
    <div className="space-y-6">
      <Card glass className="border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white">Quantum Key Distribution Simulation</CardTitle>
          <CardDescription>Configure and run a QKD protocol simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Length Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Key Length: <span className="text-violet-400 font-bold">{keyLength} bits</span>
            </label>
            <input
              type="range"
              min={64}
              max={1024}
              step={64}
              value={keyLength}
              onChange={(e) => setKeyLength(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gray-700 accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>64 bits</span>
              <span>1024 bits</span>
            </div>
          </div>

          {/* Protocol Radio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Protocol</label>
            <div className="flex gap-4">
              {(['BB84', 'E91', 'B92'] as QKDProtocol[]).map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value={p}
                    checked={protocol === p}
                    onChange={() => setProtocol(p)}
                    className="accent-violet-500"
                  />
                  <span className="text-sm text-gray-300">{p}</span>
                </label>
              ))}
            </div>
            {protocol !== 'BB84' && (
              <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-500/20 rounded-lg px-3 py-2">
                Using BB84 simulation (E91/B92 mapped to BB84 backend)
              </p>
            )}
          </div>

          <Button onClick={handleSimulate} loading={loading} className="w-full sm:w-auto">
            Simulate
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card glass className="border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-white">Session Result</CardTitle>
              <Badge variant={isLowError ? 'success' : 'destructive'}>
                QBER: {errorPct}% {isLowError ? '— Secure' : '— High Error'}
              </Badge>
            </div>
            <CardDescription className="font-mono text-xs text-gray-500">
              Session ID: {result.sessionId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Sifted Key Length</p>
                <p className="text-xl font-bold text-white">{result.siftedKeyLength} <span className="text-sm font-normal text-gray-400">bits</span></p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Secret Key Rate</p>
                <p className="text-xl font-bold text-white">
                  {result.secretKeyRate > 1e6
                    ? `${(result.secretKeyRate / 1e9).toFixed(2)} Gbps`
                    : result.secretKeyRate > 1e3
                    ? `${(result.secretKeyRate / 1e6).toFixed(2)} Mbps`
                    : `${result.secretKeyRate} bps`}
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Error Rate</p>
                <p className={`text-xl font-bold ${isLowError ? 'text-emerald-400' : 'text-red-400'}`}>
                  {errorPct}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-900/80 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Alice&apos;s Key (first 32 bits)</p>
                <code className="text-xs font-mono text-violet-300 break-all">
                  {result.aliceKey.slice(0, 32).join('')}
                </code>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Bob&apos;s Key (first 32 bits)</p>
                <code className="text-xs font-mono text-indigo-300 break-all">
                  {result.bobKey.slice(0, 32).join('')}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Certificates Tab ─────────────────────────────────────────────────────────

function CertificatesTab() {
  const [domain, setDomain] = useState('');
  const [algorithm, setAlgorithm] = useState<PQAlgorithm>('ML-KEM-768');
  const [cert, setCert] = useState<PQCertificate | null>(null);
  const [chainResult, setChainResult] = useState<{ valid: boolean; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainLoading, setChainLoading] = useState(false);

  function handleGenerate() {
    if (!domain.trim()) return;
    setLoading(true);
    setChainResult(null);
    setTimeout(() => {
      setCert(generatePQCertificate(domain.trim(), algorithm));
      setLoading(false);
    }, 300);
  }

  function handleVerifyChain() {
    if (!cert) return;
    setChainLoading(true);
    setTimeout(() => {
      // Generate a root CA cert to verify against
      const rootCA = generatePQCertificate('SellSpark Root CA (PQC)', algorithm);
      rootCA.subject = 'SellSpark Root CA (PQC)';
      setChainResult(verifyCertificateChain(cert, rootCA));
      setChainLoading(false);
    }, 300);
  }

  return (
    <div className="space-y-6">
      <Card glass className="border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white">Post-Quantum Certificate Generator</CardTitle>
          <CardDescription>Generate NIST PQC-compliant certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Domain / Subject</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. api.sellspark.io"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as PQAlgorithm)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="ML-KEM-768">ML-KEM-768</option>
              <option value="ML-DSA-65">ML-DSA-65</option>
              <option value="SLH-DSA">SLH-DSA</option>
            </select>
          </div>
          <Button onClick={handleGenerate} loading={loading} disabled={!domain.trim()}>
            Generate Certificate
          </Button>
        </CardContent>
      </Card>

      {cert && (
        <Card glass className="border-cyan-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-white">Certificate</CardTitle>
              <Badge variant="success">PQC Level 3</Badge>
            </div>
            <CardDescription className="font-mono text-xs break-all">
              ID: {cert.certId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Subject', value: cert.subject },
                { label: 'Issuer', value: cert.issuer },
                { label: 'Algorithm', value: cert.algorithm },
                { label: 'Valid From', value: new Date(cert.validFrom).toLocaleDateString() },
                { label: 'Valid To', value: new Date(cert.validTo).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-white font-medium">{value}</p>
                </div>
              ))}
              <div className="bg-gray-800/60 rounded-xl p-3 sm:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Fingerprint</p>
                <code className="text-xs font-mono text-cyan-300 break-all">{cert.fingerprint}</code>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Extensions</p>
              <ul className="space-y-1">
                {cert.extensions.map((ext, i) => (
                  <li key={i} className="text-xs font-mono text-gray-300">{ext}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" onClick={handleVerifyChain} loading={chainLoading}>
                Verify Chain
              </Button>
              {chainResult && (
                <span className={`text-sm font-medium ${chainResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {chainResult.valid ? '✅' : '❌'} {chainResult.reason}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Threats Tab ──────────────────────────────────────────────────────────────

function severityColor(s: number): string {
  if (s >= 8) return 'bg-red-500';
  if (s >= 5) return 'bg-orange-500';
  return 'bg-yellow-500';
}

function severityBadgeVariant(s: number): 'destructive' | 'warning' | 'default' {
  if (s >= 8) return 'destructive';
  if (s >= 5) return 'warning';
  return 'default';
}

function riskColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-yellow-400';
}

function ThreatsTab() {
  const [threats, setThreats] = useState<QuantumThreat[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  function handleScan() {
    setLoading(true);
    setTimeout(() => {
      setThreats(scanForThreats({}));
      setScanned(true);
      setLoading(false);
    }, 600);
  }

  const riskScore = computeQuantumRisk(threats);

  return (
    <div className="space-y-6">
      <Card glass className="border-red-500/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-white">Quantum Threat Scanner</CardTitle>
              <CardDescription>Detect cryptographic vulnerabilities to quantum attacks</CardDescription>
            </div>
            {scanned && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Overall Quantum Risk</p>
                <p className={`text-4xl font-black ${riskColor(riskScore)}`}>{riskScore}<span className="text-lg font-normal text-gray-400">/100</span></p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleScan}
            loading={loading}
            variant={scanned ? 'outline' : 'default'}
          >
            {scanned ? 'Rescan' : 'Scan System'}
          </Button>
        </CardContent>
      </Card>

      {threats.map((threat) => (
        <Card key={threat.threatId} glass className="border-gray-700/40">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-white capitalize">{threat.type.replace(/-/g, ' ')}</CardTitle>
                <CardDescription className="text-xs font-mono">
                  Detected: {new Date(threat.detectedAt).toLocaleTimeString()}
                </CardDescription>
              </div>
              <Badge variant={severityBadgeVariant(threat.severity)}>
                Severity {threat.severity}/10
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Severity bar */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Severity</p>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${severityColor(threat.severity)}`}
                  style={{ width: `${threat.severity * 10}%` }}
                />
              </div>
            </div>

            {/* Affected systems */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Affected Systems</p>
              <div className="flex flex-wrap gap-2">
                {threat.affectedSystems.map((sys) => (
                  <Badge key={sys} variant="secondary">{sys}</Badge>
                ))}
              </div>
            </div>

            {/* Mitigations */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Mitigations</p>
              <ul className="space-y-1">
                {threat.mitigations.slice(0, 3).map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-emerald-400 mt-0.5 shrink-0">☐</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── ZKP Tab ──────────────────────────────────────────────────────────────────

function ZKPTab() {
  const [statement, setStatement] = useState('');
  const [secret, setSecret] = useState('');
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  function handleGenerate() {
    if (!statement.trim() || !secret.trim()) return;
    setLoading(true);
    setVerified(null);
    setTimeout(() => {
      setProof(createZKProof(statement.trim(), secret.trim()));
      setLoading(false);
    }, 300);
  }

  function handleVerify() {
    if (!proof) return;
    setVerifyLoading(true);
    setTimeout(() => {
      setVerified(verifyZKProof(proof));
      setVerifyLoading(false);
    }, 300);
  }

  return (
    <div className="space-y-6">
      <Card glass className="border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white">Zero-Knowledge Proof Engine</CardTitle>
          <CardDescription>Schnorr-style sigma protocol simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Statement</label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g. I know a secret that hashes to 0xdeadbeef..."
              rows={3}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Secret (witness)</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret value"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <Button onClick={handleGenerate} loading={loading} disabled={!statement.trim() || !secret.trim()}>
            Generate Proof
          </Button>
        </CardContent>
      </Card>

      {proof && (
        <Card glass className="border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-white">Proof Output</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">{proof.proofId}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Commitment', value: proof.commitment, color: 'text-violet-300' },
              { label: 'Challenge', value: proof.challenge, color: 'text-cyan-300' },
              { label: 'Response', value: proof.response, color: 'text-emerald-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900/80 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                <code className={`text-xs font-mono ${color} break-all`}>
                  {value.slice(0, 60)}{value.length > 60 ? '…' : ''}
                </code>
              </div>
            ))}

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <Button variant="outline" onClick={handleVerify} loading={verifyLoading}>
                Verify Proof
              </Button>
              {verified !== null && (
                <span className={`text-sm font-semibold ${verified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {verified ? '✅ Proof Verified' : '❌ Invalid Proof'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'qkd', label: 'QKD' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'threats', label: 'Threats' },
  { id: 'zkp', label: 'ZKP' },
];

export default function QuantumSecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('qkd');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-indigo-900/10 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg">
              🔐
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Quantum Security Suite</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Post-quantum cryptography tools — QKD simulation, PQC certificates, threat detection, and zero-knowledge proofs.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'qkd' && <QKDTab />}
        {activeTab === 'certificates' && <CertificatesTab />}
        {activeTab === 'threats' && <ThreatsTab />}
        {activeTab === 'zkp' && <ZKPTab />}
      </div>
    </div>
  );
}
