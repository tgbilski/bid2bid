import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EncryptionCompliance = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background p-8 print:p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Encryption Compliance Documentation
          </h1>
          <h2 className="text-xl text-muted-foreground">
            bid2bid Mobile Application
          </h2>
          <p className="text-sm text-muted-foreground">
            For Distribution in France and European Union
          </p>
          <p className="text-sm text-muted-foreground">
            Document Date: {currentDate}
          </p>
        </div>

        {/* Application Information */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Application Name:</strong> bid2bid</p>
            <p><strong>Application ID:</strong> app.lovable.737599d9a4e34b3ea7d4dc510c5dbfee</p>
            <p><strong>Platform:</strong> iOS and Android (Capacitor)</p>
            <p><strong>Primary Function:</strong> Construction project management and vendor bidding</p>
          </CardContent>
        </Card>

        {/* Encryption Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Encryption Usage Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The bid2bid application implements industry-standard encryption protocols to protect user data 
              and ensure secure communications. All encryption used is standard, commercially available 
              encryption that does not require export licensing.
            </p>
          </CardContent>
        </Card>

        {/* Data in Transit */}
        <Card>
          <CardHeader>
            <CardTitle>Data in Transit Encryption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">HTTPS/TLS Encryption</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Protocol: TLS 1.2 and TLS 1.3</li>
                <li>All API communications encrypted using HTTPS</li>
                <li>Strong cipher suites including AES-256-GCM</li>
                <li>Perfect Forward Secrecy (PFS) enabled</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Purpose</h4>
              <p>Protects all data transmission between the mobile application and backend servers.</p>
            </div>
          </CardContent>
        </Card>

        {/* Data at Rest */}
        <Card>
          <CardHeader>
            <CardTitle>Data at Rest Encryption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Database Encryption</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Algorithm: AES-256 encryption</li>
                <li>Provider: Supabase (PostgreSQL with encryption at rest)</li>
                <li>Key Management: Managed by cloud provider</li>
                <li>All user data, project information, and vendor details encrypted</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Authentication Data</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Password Hashing: bcrypt with salt</li>
                <li>Session Tokens: JWT with cryptographic signatures</li>
                <li>No plaintext passwords stored</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Authentication & Authorization */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication & Authorization Encryption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">JWT Tokens</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Algorithm: RS256 (RSA with SHA-256)</li>
                <li>Used for session management and API authorization</li>
                <li>Cryptographically signed for integrity verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">OAuth 2.0</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Standard OAuth 2.0 implementation</li>
                <li>Secure token exchange protocols</li>
                <li>PKCE (Proof Key for Code Exchange) for mobile security</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Export Control Compliance Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Classification</h4>
              <p>
                The encryption used in bid2bid qualifies as "publicly available" encryption under:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>EU Dual-Use Regulation (EU) 2021/821</li>
                <li>Wassenaar Arrangement Category 5 Part 2</li>
                <li>Standard commercial encryption protocols</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Exemption Qualification</h4>
              <p>
                This application is exempt from export licensing requirements because:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Uses only standard, publicly available encryption algorithms</li>
                <li>No proprietary or military-grade encryption is implemented</li>
                <li>Encryption is limited to standard web security practices</li>
                <li>Primary purpose is commercial data protection, not cryptographic functionality</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Regulatory Compliance</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>GDPR compliant data protection measures</li>
                <li>Follows EU cybersecurity best practices</li>
                <li>Implements standard industry encryption protocols</li>
                <li>No encryption export restrictions apply</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Encryption Libraries</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>OpenSSL/BoringSSL for TLS implementation</li>
                <li>Standard JavaScript/TypeScript cryptographic libraries</li>
                <li>React Native/Capacitor standard encryption APIs</li>
                <li>Supabase client-side encryption utilities</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Key Strength</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>AES-256 (256-bit keys)</li>
                <li>RSA-2048 minimum for asymmetric encryption</li>
                <li>SHA-256 or stronger for hashing</li>
                <li>Elliptic Curve P-256 or stronger when applicable</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Declaration */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Declaration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              I hereby declare that the information provided in this document is accurate and complete 
              to the best of my knowledge. The bid2bid application uses only standard, commercially 
              available encryption technologies for the protection of user data and does not contain 
              any encryption functionality that would require export licensing under applicable 
              French or EU regulations.
            </p>
            
            <div className="mt-8 pt-4 border-t">
              <p><strong>Application:</strong> bid2bid</p>
              <p><strong>Developer:</strong> [Your Name/Company]</p>
              <p><strong>Date:</strong> {currentDate}</p>
              <p><strong>Signature:</strong> _________________________</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 print:mt-4">
          <p>
            This document serves as encryption compliance documentation for the distribution 
            of bid2bid in France and the European Union.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EncryptionCompliance;