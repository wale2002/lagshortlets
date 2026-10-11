import {catalogue,database,json,sameOrigin,clientKey} from '../../server';
import {rateLimit} from '../../lib/mongodb';
export const runtime='nodejs';
function validDate(s:unknown){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return json({error:'Please submit your enquiry from the LAG website.'},403);
 if(Number(req.headers.get('content-length')||0)>12000)return json({error:'Your request is too large.'},413);
 const d=await req.json(),stay=(await catalogue()).find(s=>s.id===d.propertyId),today=new Date().toISOString().slice(0,10);
 if(!stay||typeof d.name!=='string'||!d.name.trim()||d.name.length>100||typeof d.phone!=='string'||!/^\+?[0-9 ()-]{8,22}$/.test(d.phone)||d.consent!=='yes'||!validDate(d.checkin)||!validDate(d.checkout)||d.checkout<=d.checkin||d.checkin<today||!Number.isInteger(d.guests)||d.guests<1||d.guests>stay.guests||typeof d.requestKey!=='string'||!/^[a-f0-9-]{36}$/.test(d.requestKey))return json({error:'Please check your name, contact number, dates, guest count, and consent.'},400);
 if(d.email&&(typeof d.email!=='string'||!/^\S+@[^\s@]+\.[^\s@]+$/.test(d.email)||d.email.length>150))return json({error:'Please enter a valid email address.'},400);
 if(d.message&&(typeof d.message!=='string'||d.message.length>2000))return json({error:'Your message must be under 2,000 characters.'},400);
 if((Date.parse(d.checkout)-Date.parse(d.checkin))/86400000<stay.minimumNights)return json({error:'This stay requires at least '+stay.minimumNights+' nights.'},400);
 const db=await database(),enquiries=db.collection('enquiries'),existing=await enquiries.findOne({request_key:d.requestKey},{projection:{reference:1}});
 if(existing)return json({reference:existing.reference});
 if(!await rateLimit('enquiry:'+await clientKey(req),12,3600000))return json({error:'Too many requests. Please try again later or contact LAG on WhatsApp.'},429);
 const id=crypto.randomUUID(),reference='LAG-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+id.slice(0,6).toUpperCase(),now=new Date().toISOString();
 const record={id,reference,request_key:d.requestKey,property_id:stay.id,property_title:stay.title,name:d.name.trim(),phone:d.phone,email:d.email||null,checkin:d.checkin,checkout:d.checkout,guests:d.guests,message:(stay.demo?'[DEMO ENQUIRY] ':'')+(d.message||''),status:'New',assigned_to:'lagshortlets@gmail.com',notes:'',created_at:now,updated_at:now};
 let saved;
 try{saved=await enquiries.findOneAndUpdate({request_key:d.requestKey},{$setOnInsert:record},{upsert:true,returnDocument:'after'});}catch(error:any){if(error?.code!==11000)throw error;saved=await enquiries.findOne({request_key:d.requestKey});}
 if(!saved)throw new Error('Enquiry was not accepted');return json({reference:saved.reference},201);
 }catch{console.error('enquiry_storage_failed');return json({error:'We could not store your enquiry. Your details are still here; please retry or use WhatsApp.'},503);}}
