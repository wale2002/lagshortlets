import {staff,database,json,sameOrigin,auditEvent} from '../../../server';
import {base32,seal,unseal,totp,recordMfaAttempt} from '../../../vault-security';
import {sessionCookie} from '../../../lib/security';
export const runtime='nodejs';
export async function POST(req:Request){try{if(!sameOrigin(req))return json({error:'Invalid origin'},403);const user=await staff();if(!user)return json({error:'Staff access is required'},403);if(Number(req.headers.get('content-length')||0)>2000)return json({error:'Request too large'},413);const d=await req.json(),db=await database(),mfa=db.collection('staff_mfa');
 if(d.action==='logout')return new Response('{}',{headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie('lag-vault','',0)}});
 if(d.action==='begin'){const secret=base32(crypto.getRandomValues(new Uint8Array(20)));try{await mfa.updateOne({user_id:user.userId},{$setOnInsert:{user_id:user.userId,secret:await seal(secret),enabled:0,last_counter:0}},{upsert:true});}catch(error:any){if(error?.code!==11000)throw error;}const record=await mfa.findOne({user_id:user.userId});if(!record)throw new Error('Enrollment unavailable');return json({enrolled:Boolean(record.enabled),secret:record.enabled?null:await unseal(record.secret)});}
 if(d.action!=='verify'||typeof d.code!=='string'||!/^\d{6}$/.test(d.code))return json({error:'Enter the six-digit authenticator code.'},400);
 if(!await recordMfaAttempt(user.userId))return json({error:'Too many attempts. Wait five minutes and try again.'},429);
 const record=await mfa.findOne({user_id:user.userId});if(!record)return json({error:'Begin authenticator setup first.'},400);
 const secret=await unseal(record.secret),counter=Math.floor(Date.now()/30000);let matched=-1;for(let n=counter-1;n<=counter+1;n++)if(n>record.last_counter&&await totp(secret,n)===d.code)matched=n;
 if(matched<0)return json({error:'That code is invalid or has already been used. Try the next code.'},400);
 const updated=await mfa.updateOne({user_id:user.userId,last_counter:{$lt:matched}},{$set:{enabled:1,last_counter:matched}});if(!updated.modifiedCount)return json({error:'Please use a fresh authenticator code.'},400);
 await auditEvent(user.email,'Vault second factor verified',user.userId);const token=await seal(JSON.stringify({purpose:'vault',uid:user.userId,exp:Date.now()+1800000}));return new Response(JSON.stringify({verified:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':sessionCookie('lag-vault',token,1800)}});
 }catch{return json({error:'Vault verification is temporarily unavailable.'},503);}}
