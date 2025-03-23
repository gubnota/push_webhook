// import { encodeBase64Url } from "node:buffer"; //"https://deno.land/std/encoding/base64url.ts";

async function generateAPNsJWT(config: {
  teamId: string;
  keyId: string;
  privateKey: string;
}): Promise<string> {
  // Convert PEM to raw binary format
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = config.privateKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replaceAll("\n", "");

  const binaryKey = base64Decode(pemContents);

  // Import the private key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign"]
  );

  // Create JWT components
  const header = {
    alg: "ES256",
    typ: "JWT",
    kid: config.keyId,
  };

  const payload = {
    iss: config.teamId,
    iat: Math.floor(Date.now() / 1000),
  };

  // Encode header and payload
  const encoder = new TextEncoder();
  const encodedHeader = encodeBase64Url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = encodeBase64Url(
    encoder.encode(JSON.stringify(payload))
  );
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    cryptoKey,
    encoder.encode(signingInput)
  );

  // Convert signature to base64url
  const encodedSignature = encodeBase64Url(new Uint8Array(signature));

  return `${signingInput}.${encodedSignature}`;
}

// Helper function for base64 decoding
function base64Decode(input: string): Uint8Array {
  return Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
}

function encodeBase64Url(input: Uint8Array): string {
  // Convert to standard base64
  const base64 = Buffer.from(input).toString("base64");

  // Make URL-safe: replace characters and remove padding
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default generateAPNsJWT;
