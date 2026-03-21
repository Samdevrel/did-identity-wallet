'use client';

import { useState } from 'react';

interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  claims: Record<string, string | number | boolean>;
  verified: boolean;
}

interface DID {
  id: string;
  method: string;
  created: Date;
}

const sampleCredentials: Credential[] = [
  {
    id: 'vc-001',
    type: 'AgeVerification',
    issuer: 'did:web:gov.example.com',
    issuedAt: new Date('2026-01-15'),
    expiresAt: new Date('2031-01-15'),
    claims: { over18: true, over21: true, over65: false },
    verified: true,
  },
  {
    id: 'vc-002',
    type: 'UniversityDegree',
    issuer: 'did:web:university.edu',
    issuedAt: new Date('2024-06-01'),
    claims: { degree: 'Bachelor of Science', field: 'Computer Science', graduated: true },
    verified: true,
  },
  {
    id: 'vc-003',
    type: 'EmploymentCredential',
    issuer: 'did:web:acme-corp.com',
    issuedAt: new Date('2025-03-01'),
    claims: { employer: 'Acme Corp', role: 'Software Engineer', active: true },
    verified: true,
  },
  {
    id: 'vc-004',
    type: 'KYCVerification',
    issuer: 'did:web:kyc-provider.com',
    issuedAt: new Date('2026-02-20'),
    expiresAt: new Date('2027-02-20'),
    claims: { level: 'Enhanced', jurisdiction: 'EU', accredited: false },
    verified: true,
  },
];

const userDID: DID = {
  id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  method: 'key',
  created: new Date('2025-12-01'),
};

export default function Home() {
  const [credentials, setCredentials] = useState(sampleCredentials);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [presentationResult, setPresentationResult] = useState<string | null>(null);

  const toggleClaim = (claim: string) => {
    setSelectedClaims(prev => 
      prev.includes(claim) ? prev.filter(c => c !== claim) : [...prev, claim]
    );
  };

  const createPresentation = () => {
    if (!selectedCredential || selectedClaims.length === 0) return;
    
    const presentation = {
      type: 'VerifiablePresentation',
      holder: userDID.id,
      verifiableCredential: {
        type: selectedCredential.type,
        issuer: selectedCredential.issuer,
        selectiveDisclosure: selectedClaims.reduce((acc, claim) => {
          acc[claim] = selectedCredential.claims[claim];
          return acc;
        }, {} as Record<string, any>),
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        proofPurpose: 'authentication',
      },
    };

    setPresentationResult(JSON.stringify(presentation, null, 2));
  };

  const resetPresentation = () => {
    setPresentationMode(false);
    setSelectedClaims([]);
    setPresentationResult(null);
    setSelectedCredential(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b-4 border-purple-400 bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black">DID Identity Wallet</h1>
          <p className="text-gray-400 mt-2">Self-sovereign identity with verifiable credentials</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Your DID */}
        <section className="bg-gray-900 border-4 border-purple-400 p-6">
          <h2 className="text-sm font-bold text-gray-400 mb-4">YOUR DECENTRALIZED IDENTIFIER</h2>
          <div className="p-4 bg-purple-900/30 border-2 border-purple-500">
            <div className="font-mono text-sm text-purple-400 break-all">{userDID.id}</div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-gray-400">Method: <span className="text-white">{userDID.method}</span></span>
              <span className="text-gray-400">Created: <span className="text-white">{userDID.created.toLocaleDateString()}</span></span>
            </div>
          </div>
        </section>

        {/* Credentials List */}
        <section className="bg-gray-900 border-4 border-gray-700 p-6">
          <h2 className="text-sm font-bold text-gray-400 mb-4">YOUR VERIFIABLE CREDENTIALS ({credentials.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                onClick={() => {
                  setSelectedCredential(cred);
                  setPresentationMode(false);
                  setSelectedClaims([]);
                  setPresentationResult(null);
                }}
                className={`p-4 border-4 cursor-pointer transition-all ${
                  selectedCredential?.id === cred.id
                    ? 'bg-purple-900/30 border-purple-400'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-purple-400">{cred.type}</h3>
                    <p className="text-xs text-gray-400 font-mono">{cred.issuer}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold ${
                    cred.verified ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                  }`}>
                    {cred.verified ? '✓ VERIFIED' : '✗ INVALID'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Issued: {cred.issuedAt.toLocaleDateString()}
                  {cred.expiresAt && ` • Expires: ${cred.expiresAt.toLocaleDateString()}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.keys(cred.claims).slice(0, 3).map((claim) => (
                    <span key={claim} className="px-2 py-0.5 bg-gray-700 text-xs rounded">
                      {claim}
                    </span>
                  ))}
                  {Object.keys(cred.claims).length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-700 text-xs rounded">
                      +{Object.keys(cred.claims).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Credential Detail */}
        {selectedCredential && !presentationMode && (
          <section className="bg-gray-900 border-4 border-purple-400 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-black text-purple-400">{selectedCredential.type}</h2>
                <p className="text-sm text-gray-400 font-mono">{selectedCredential.issuer}</p>
              </div>
              <button
                onClick={resetPresentation}
                className="px-4 py-2 bg-gray-700 text-white font-bold border-2 border-gray-600 hover:bg-gray-600"
              >
                Close
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-2">CLAIMS</h3>
              <div className="space-y-2">
                {Object.entries(selectedCredential.claims).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 bg-gray-800 border border-gray-700">
                    <span className="text-gray-300">{key}</span>
                    <span className={`font-bold ${
                      typeof value === 'boolean' 
                        ? (value ? 'text-green-400' : 'text-red-400')
                        : 'text-white'
                    }`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPresentationMode(true)}
              className="w-full py-3 bg-purple-500 text-white font-bold border-4 border-purple-400 hover:bg-purple-400"
            >
              Create Verifiable Presentation →
            </button>
          </section>
        )}

        {/* Presentation Mode */}
        {selectedCredential && presentationMode && (
          <section className="bg-gray-900 border-4 border-yellow-400 p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">Selective Disclosure</h2>
            <p className="text-gray-300 mb-4">
              Choose which claims to reveal. Only selected claims will be shared with the verifier.
            </p>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-2">SELECT CLAIMS TO DISCLOSE</h3>
              <div className="space-y-2">
                {Object.entries(selectedCredential.claims).map(([key, value]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-3 cursor-pointer border-2 transition-all ${
                      selectedClaims.includes(key)
                        ? 'bg-yellow-900/30 border-yellow-400'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedClaims.includes(key)}
                        onChange={() => toggleClaim(key)}
                        className="w-5 h-5"
                      />
                      <span className="text-gray-300">{key}</span>
                    </div>
                    <span className="font-mono text-sm text-gray-400">{String(value)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={createPresentation}
                disabled={selectedClaims.length === 0}
                className="flex-1 py-3 bg-yellow-500 text-black font-bold border-4 border-yellow-400 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Presentation ({selectedClaims.length} claims)
              </button>
              <button
                onClick={resetPresentation}
                className="px-6 py-3 bg-gray-700 text-white font-bold border-4 border-gray-600 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Presentation Result */}
        {presentationResult && (
          <section className="bg-gray-900 border-4 border-green-400 p-6">
            <h2 className="text-xl font-black text-green-400 mb-4">✓ Verifiable Presentation Generated</h2>
            <pre className="p-4 bg-gray-800 border-2 border-gray-700 overflow-x-auto text-sm text-green-300 font-mono">
              {presentationResult}
            </pre>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(presentationResult)}
                className="flex-1 py-3 bg-green-500 text-white font-bold border-4 border-green-400 hover:bg-green-400"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={resetPresentation}
                className="px-6 py-3 bg-gray-700 text-white font-bold border-4 border-gray-600 hover:bg-gray-600"
              >
                Done
              </button>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="bg-gray-900 border-4 border-gray-700 p-6">
          <h2 className="text-xl font-black mb-4">How SSI Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-800 border-2 border-gray-600 text-center">
              <div className="text-3xl mb-2">🆔</div>
              <h3 className="font-bold text-purple-400 mb-2">1. Create DID</h3>
              <p className="text-sm text-gray-400">
                Generate a decentralized identifier you control. No central authority needed.
              </p>
            </div>
            <div className="p-4 bg-gray-800 border-2 border-gray-600 text-center">
              <div className="text-3xl mb-2">📜</div>
              <h3 className="font-bold text-blue-400 mb-2">2. Collect Credentials</h3>
              <p className="text-sm text-gray-400">
                Issuers (gov, universities, employers) issue verifiable credentials to your wallet.
              </p>
            </div>
            <div className="p-4 bg-gray-800 border-2 border-gray-600 text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-bold text-green-400 mb-2">3. Selective Disclosure</h3>
              <p className="text-sm text-gray-400">
                Share only what's needed. Prove you're over 21 without revealing your birthdate.
              </p>
            </div>
          </div>
        </section>

        {/* EUDI Wallet */}
        <section className="bg-gray-900 border-4 border-purple-400 p-6">
          <h2 className="text-xl font-black text-purple-400 mb-4">EU Digital Identity Wallet (EUDI)</h2>
          <p className="text-gray-300 mb-4">
            By end of 2026, every EU member state must deploy a digital identity wallet. 
            This simulator shows how SSI and verifiable credentials work under the hood.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-800 border-l-4 border-blue-400">
              <h3 className="font-bold text-blue-400">W3C Standards</h3>
              <p className="text-gray-400">DIDs and Verifiable Credentials follow W3C specifications for interoperability.</p>
            </div>
            <div className="p-3 bg-gray-800 border-l-4 border-green-400">
              <h3 className="font-bold text-green-400">Privacy by Design</h3>
              <p className="text-gray-400">Zero-knowledge proofs enable verification without exposing raw data.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
          <p>
            Built by <a href="https://x.com/samdevrel" className="text-purple-400 hover:underline">@samdevrel</a>
            {' • '}
            <a href="https://github.com/Samdevrel/did-identity-wallet" className="text-gray-400 hover:underline">Source Code</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
