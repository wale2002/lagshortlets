import 'server-only';
import {MongoClient, Db, ClientSession} from 'mongodb';
type Connection = {client:MongoClient;db:Db};
const cache=globalThis as typeof globalThis & {lagMongo?:Promise<Connection>};
export async function connection():Promise<Connection>{
 if(!cache.lagMongo)cache.lagMongo=(async()=>{const uri=process.env.MONGODB_URI;if(!uri)throw new Error('MongoDB is not configured');const client=new MongoClient(uri,{maxPoolSize:8,serverSelectionTimeoutMS:10000,appName:'lagshortlets'});try{await client.connect();const db=client.db(process.env.MONGODB_DB_NAME||'lagshortlets');await Promise.all([
 db.collection('properties').createIndex({id:1},{unique:true}),db.collection('properties').createIndex({slug:1},{unique:true}),db.collection('properties').createIndex({status:1,updated_at:-1}),
 db.collection('enquiries').createIndex({request_key:1},{unique:true}),db.collection('enquiries').createIndex({reference:1},{unique:true}),db.collection('enquiries').createIndex({created_at:-1}),
 db.collection('staff_mfa').createIndex({user_id:1},{unique:true}),db.collection('request_limits').createIndex({key:1},{unique:true}),db.collection('request_limits').createIndex({expires_at:1},{expireAfterSeconds:0}),
 db.collection('partners').createIndex({id:1},{unique:true}),db.collection('audit').createIndex({created_at:-1}),db.collection('availability_history').createIndex({property_id:1,created_at:-1})
 ]);return {client,db};}catch(error){await client.close();throw error;}})().catch(error=>{delete cache.lagMongo;throw error;});return cache.lagMongo;
}
export async function database(){return (await connection()).db;}
export async function transaction(work:(db:Db,session:ClientSession)=>Promise<void>){const {client,db}=await connection(),session=client.startSession();try{await session.withTransaction(()=>work(db,session),{maxCommitTimeMS:5000});}finally{await session.endSession();}}
export async function rateLimit(key:string,maximum:number,windowMs:number){const bucket=Math.floor(Date.now()/windowMs),db=await database(),name=key+':'+bucket,update={$inc:{count:1},$setOnInsert:{expires_at:new Date((bucket+2)*windowMs)}};let record;try{record=await db.collection('request_limits').findOneAndUpdate({key:name},update,{upsert:true,returnDocument:'after'});}catch(error:any){if(error?.code!==11000)throw error;record=await db.collection('request_limits').findOneAndUpdate({key:name},update,{returnDocument:'after'});}return Boolean(record&&record.count<=maximum);}
