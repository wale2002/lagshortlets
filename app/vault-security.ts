import 'server-only';
import {cookies} from 'next/headers';
import {staff} from './server';
import {unseal} from './lib/security';
import {rateLimit} from './lib/mongodb';
export {base32,seal,unseal,totp} from './lib/security';
export async function vaultStaff(){const u=await staff();if(!u)return null;try{const c=(await cookies()).get('lag-vault')?.value;if(!c)return null;const session=JSON.parse(await unseal(c));if(session.purpose!=='vault'||session.uid!==u.userId||session.exp<Date.now())return null;return u;}catch{return null;}}
export async function recordMfaAttempt(id:string){return rateLimit('mfa:'+id,8,300000);}
