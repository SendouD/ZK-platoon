import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { EphemeralKey, LocalStorageKeys } from '../../lib/types.js';
import { bytesToBigInt,bigIntToBytes } from '../../lib/utils.js'; 
import { Barretenberg, Fr, ProofData } from "@aztec/bb.js";
import { JWT_CIRCUIT_HELPER } from '../../hooks/useJwtproof.jsx';
type TokenResponse = {
  proof: any;
  proofArgs: { keyId: any };
  anonGroup: string;
  publicInputs:any;
} | undefined;
export async function handletoken(token:string,EphemeralKey:EphemeralKey,nonce:string):Promise<TokenResponse>{
  try{
    const [headersB64, payloadB64] = token.split(".");
    const headers = JSON.parse(atob(headersB64));
    const payload = JSON.parse(atob(payloadB64));
    console.log(payload,nonce);
    if(payload.nonce !== nonce){
      alert(`Nonce does not match: ${payload.nonce} !== ${nonce}`);
      return undefined; // Explicitly return undefined in the catch block
    }
    const domain = payload.hd;
    const keyId = headers.kid;
    const googleJWTPubkey = await fetchGooglePublicKey(keyId);
    console.log("googleJWTPubkey", googleJWTPubkey)
    const proof = await JWT_CIRCUIT_HELPER.generateProof({
          idToken:token,
          jwtPubkey: googleJWTPubkey,
          ephemeralKey: EphemeralKey,
          domain,
        });
        console.log("proof",proof);
        const anonGroup=domain;
        const proofArgs = {keyId,}
        return { proof:proof.proof, proofArgs, anonGroup ,publicInputs:proof.publicInputs};
      }
        catch(error){
          console.log(error);
          return undefined; // Explicitly return undefined in the catch block
        }
  }

  export async function fetchGooglePublicKey(keyId: string) {
    if (!keyId) {
      return undefined; // Explicitly return undefined in the catch block
    }
  
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
    const keys = await response.json();
  
    const key = keys.keys.find((key: { kid: string }) => key.kid === keyId);
    if (!key) {
      console.error(`Google public key with id ${keyId} not found`);
      return null;
    }
  
    return key;
  }
  
  ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));


  export async function generateEphemeralKey(): Promise<EphemeralKey> {
    const privKey = ed25519.utils.randomPrivateKey();
    const privKeyBigInt = bytesToBigInt(privKey);
  
    const pubKey = await ed25519.getPublicKeyAsync(privKey);
    const pubKeyBigInt = bytesToBigInt(pubKey);
  
    const salt = ed25519.utils.randomPrivateKey().slice(0, 30); // a random 30 byte salt
    const saltBigInt = bytesToBigInt(salt);
  
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week from now
  
    const bb = await Barretenberg.new();
    const ephemeralPubkeyHash = await bb.poseidon2Hash([
      new Fr(pubKeyBigInt >> 3n),
      new Fr(saltBigInt),
      new Fr(BigInt(Math.floor(expiry / 1000))),
    ]);
    const ephemeralPubkeyHashBigInt = bytesToBigInt(ephemeralPubkeyHash.value);
  
    const ephemeralKey: EphemeralKey = {
      privateKey: privKeyBigInt,
      publicKey: pubKeyBigInt,
      salt: saltBigInt,
      expiry: new Date(expiry),
      ephemeralPubkeyHash: ephemeralPubkeyHashBigInt,
    };
  
    saveEphemeralKey(ephemeralKey);
  
    return { ...ephemeralKey, privateKey: 0n }; // no need to expose private key outside this file
  }
  function saveEphemeralKey(ephemeralKey: EphemeralKey) {
    localStorage.setItem(LocalStorageKeys.EphemeralKey, JSON.stringify({
      privateKey: ephemeralKey.privateKey.toString(),
      publicKey: ephemeralKey.publicKey.toString(),
      salt: ephemeralKey.salt.toString(),
      expiry: ephemeralKey.expiry,
      ephemeralPubkeyHash: ephemeralKey.ephemeralPubkeyHash.toString(),
    }));
  }
  
  
