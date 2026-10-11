import 'server-only';
import {cookies} from 'next/headers';
import {unseal} from './lib/security';
import {demoStays,Stay} from './data';
import {database} from './lib/mongodb';
export {database} from './lib/mongodb';
export function roleForEmail(email:string){const list=(key:string)=>(process.env[key]||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);if(list('LAG_ADMIN_EMAILS').includes(email))return 'Administrator';if(list('LAG_STAFF_EMAILS').includes(email))return 'Operations';return null;}
export async function staff(){try{const token=(await cookies()).get('lag-staff')?.value;if(!token)return null;const session=JSON.parse(await unseal(token));if(session.purpose!=='staff'||typeof session.email!=='string'||session.exp<Date.now())return null;const role=roleForEmail(session.email);if(!role)return null;return {userId:session.email,email:session.email,role};}catch{return null;}}
const keys=['id','slug','title','zone','area','type','beds','baths','guests','nightly','monthly','images','amenities','collections','description','rules','minimumNights','publishedAt','availability','demo','enquiryOnly','purpose','plotSizes'] as const;
export function publicStay(value:any):Stay{return Object.fromEntries(keys.map(k=>[k,value[k]])) as Stay;}
export async function catalogue(){try{const records=await (await database()).collection('properties').find({status:'Live'},{projection:{public_data:1,_id:0}}).toArray(),actual=records.map(x=>publicStay(JSON.parse(x.public_data))).filter(x=>x.availability!=='Unavailable');return records.length?actual:demoStays;}catch{console.error('catalogue_storage_unavailable');return demoStays;}}
export async function auditEvent(actor:string,action:string,recordId:string){await (await database()).collection('audit').insertOne({id:crypto.randomUUID(),actor,action,record_id:recordId,created_at:new Date().toISOString()});}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return Boolean(origin&&origin===new URL(req.url).origin);}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function clientKey(req:Request){const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';return Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip))).toString('hex');}
