# SellSpark Security Policy

## Reporting a Vulnerability

**Do NOT file a public GitHub issue for security vulnerabilities.**

Email: **security@sellspark.com**  
Response time: < 4 hours for critical, < 24 hours for others  
PGP: Available at https://sellspark.com/security  

We operate a responsible disclosure program. Researchers who report valid vulnerabilities will be credited (if desired) and may be eligible for bounties.

---

## Security Architecture — In Depth

### Post-Quantum Cryptography

SellSpark uses **CRYSTALS-Kyber** (now standardized as ML-KEM by NIST in FIPS 203) for key encapsulation. This protects against "harvest now, decrypt later" attacks where adversaries collect ciphertext today to decrypt once quantum computers are available.

**Implementation details:**
- Ring: Zq[X]/(X^256 + 1), q = 3329
- Security level: Kyber-512 (NIST Level 1) by default, configurable to Kyber-1024
- Hybrid mode: Kyber KEM + AES-256-GCM (encrypt-then-MAC)
- Session fingerprinting: quantum-safe token generated per session

### Zero-Knowledge Proofs

Auth flows use **Schnorr-like proofs** via the Fiat-Shamir heuristic:
1. Prover commits to random nonce r: `R = g^r mod p`
2. Challenge derived by hashing (Fiat-Shamir): `c = H(R || message)`
3. Response: `s = r + c*x mod (p-1)`
4. Verifier checks: `g^s = R * y^c mod p`

This means the server never sees or stores passwords.

### Quantum Key Distribution (BB84)

For high-security sessions (Enterprise plan), BB84 QKD is used:
1. Alice prepares qubits in random bases (rectilinear/diagonal)
2. Bob measures in random bases
3. Sifting: keep bits where bases matched
4. Error rate (QBER) must be < 11% — above this indicates eavesdropping
5. Privacy amplification produces final session key

### Fraud Detection

Multi-layer GNN-inspired fraud graph:
1. **Velocity signals** — orders per hour, account age
2. **Device fingerprint** — canvas, WebGL, audio context hashing
3. **Geolocation** — IP-to-country distance from account home
4. **Behavioral** — typing patterns, mouse movement entropy
5. **Payment** — BIN country vs IP, card testing patterns
6. **Label propagation** — community detection across the fraud graph
7. **Anomaly score** — 0-100 risk composite

### Data Privacy

- **Differential Privacy**: Laplace noise (ε = 0.1) injected into aggregate analytics
- **Additive Homomorphic**: Platform-level metrics aggregated over encrypted values
- **No raw biometric data** leaves user devices
- Watermarks embedded in delivered content are buyer-specific (LSB steganography)

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | ✅ Active |
| < 1.0 | ❌ No support |

---

## Security Checklist (for operators)

- [ ] Rotate `NEXTAUTH_SECRET` every 90 days
- [ ] Rotate Stripe webhook secret after any team change
- [ ] Enable Cloudflare WAF rules for API endpoints
- [ ] Enable Stripe Radar rules for fraud
- [ ] Review API key permissions — use least privilege
- [ ] Enable 2FA on Stripe, Vercel, GitHub, Supabase
- [ ] Subscribe to security@sellspark.com advisories

---

## Known Limitations

1. **BB84 QKD** is simulated — true quantum hardware requires physical fiber/photon infrastructure. The implementation provides the protocol structure and QBER calculation; the security benefit is realized when running on actual quantum hardware.

2. **DNA Storage** is a codec — physical DNA synthesis/sequencing requires laboratory equipment and is not currently automated within the platform.

3. **BCI/EEG** requires compatible hardware (Muse, Neurable, Emotiv). The signal processing runs client-side when hardware is connected.
