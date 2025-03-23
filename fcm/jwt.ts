// import { initializeApp, cert } from "npm:firebase/app";
// import { getMessaging, getToken } from "npm:firebase/messaging";
import { JWT } from "google-auth-library"; //"npm:google-auth-library@9";
import type { firebaseEntries } from "../types.d.ts";

// Generate Firebase Access Token
// Get the base64 string from environment variable
const base64String = process.env.FIREBASE_SA_BASE64!;
// Decode base64 to Uint8Array, then convert to UTF-8 string
const decodedString = atob(base64String);
// Parse the JSON string
const config = JSON.parse(decodedString) as firebaseEntries;

export { config };
// Initialize Firebase
// const app = admin.initializeApp({
//   credential: cert({ privateKey: config.private_key }),
// });
// export default app;
export default async function generateFCMJWT() {
  const accessToken = await getAccessToken({
    clientEmail: config.client_email,
    privateKey: config.private_key,
  });
  return accessToken;
  //   // Convert the private key string to a CryptoKey
  //   const privateKey = await convertPrivateKeyToCryptoKey(config.private_key);

  //   const jwt = await create(
  //     { alg: "RS256", typ: "JWT" },
  //     {
  //       iss: config.client_email,
  //       scope: "https://www.googleapis.com/auth/firebase.messaging",
  //       aud: "https://oauth2.googleapis.com/token",
  //       exp: Math.floor(Date.now() / 1000) + 3600,
  //       iat: Math.floor(Date.now() / 1000),
  //     },
  //     privateKey
  //   );

  //   const response = await fetch("https://oauth2.googleapis.com/token", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  //   });

  //   const { access_token } = await response.json();
  //   return access_token;
  // }

  // async function convertPrivateKeyToCryptoKey(
  //   privateKey: string
  // ): Promise<CryptoKey> {
  //   // Replace begin/end header, remove whitespace, base64 decode
  //   const keyWithoutHeaders = privateKey
  //     .replace("-----BEGIN PRIVATE KEY-----", "")
  //     .replace("-----END PRIVATE KEY-----", "")
  //     .replace(/\s/g, "");
  //   const keyBuffer = Uint8Array.from(atob(keyWithoutHeaders), (c) =>
  //     c.charCodeAt(0)
  //   );

  //   try {
  //     const key = await crypto.subtle.importKey(
  //       "pkcs8",
  //       keyBuffer,
  //       {
  //         name: "RSASSA-PKCS1-v1_5",
  //         hash: "SHA-256",
  //       },
  //       false,
  //       ["sign"]
  //     );
  //     return key;
  //   } catch (error) {
  //     console.error("Error importing private key:", error);
  //     throw error; // Re-throw the error so the calling function knows it failed
  //   }
}

const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens!.access_token!);
    });
  });
};
