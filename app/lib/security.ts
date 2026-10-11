import 'server-only';
import {scryptSync,timingSafeEqual} from 'node:crypto';
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes:Uint8Array){let bits=0,value=0,out='';for(const b of bytes){value=(value<<8)|b;bits+=8;while(bits>=5){out+=alphabet[(value>>>(bits-5))&31];bits-=5;}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
function unbase32(s:string){let bits=0,value=0,out:number[]=[];for(const c of s){value=(value<<5)|alphabet.indexOf(c);bits+=5;if(bits>=8){out.push((value>>>(bits-8))&255);bits-=8;}}return new Uint8Array(out);}
async function key(){const raw=process.env.LAG_AUTH_SECRET;if(!raw||raw.length<40)throw new Error('Vault security is not configured');return crypto.subtle.importKey('raw',new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),'AES-GCM',false,['encrypt','decrypt']);}
function b64(b:Uint8Array){return Buffer.from(b).toString('base64url');}
function unb64(s:string){return new Uint8Array(Buffer.from(s,'base64url'));}
export async function seal(s:string){const iv=crypto.getRandomValues(new Uint8Array(12)),b=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(s)));return b64(iv)+'.'+b64(b);}
export async function unseal(s:string){const [iv,b]=s.split('.');if(!iv||!b)throw new Error('Invalid session');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},await key(),unb64(b)));}
export async function totp(secret:string,counter:number){const bytes=new Uint8Array(8);new DataView(bytes.buffer).setBigUint64(0,BigInt(counter));const k=await crypto.subtle.importKey('raw',unbase32(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']),hash=new Uint8Array(await crypto.subtle.sign('HMAC',k,bytes)),p=hash[hash.length-1]&15,v=((hash[p]&127)<<24)|(hash[p+1]<<16)|(hash[p+2]<<8)|hash[p+3];return String(v%1000000).padStart(6,'0');}
export function passwordMatches(password:string,encoded:string){try{const [scheme,salt,key]=encoded.split(':');if(scheme!=='scrypt'||!salt||!/^[a-f0-9]{128}$/.test(key))return false;return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex'));}catch{return false;}}
export function sessionCookie(name:string,value:string,maxAge:number){return `${name}=${value}; HttpOnly; ${process.env.NODE_ENV==='production'?'Secure; ':''}SameSite=Strict; Path=/; Max-Age=${maxAge}`;}
