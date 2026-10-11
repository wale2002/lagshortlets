import {MongoClient} from 'mongodb';
import {v2 as cloudinary} from 'cloudinary';
import {randomUUID} from 'node:crypto';
try{process.loadEnvFile('.env.local');}catch{}
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
let failed=false,uploaded=false;const publicId='lagshortlets/verification/'+randomUUID();
try{await client.connect();await client.db(process.env.MONGODB_DB_NAME||'lagshortlets').command({ping:1});console.log('MongoDB: authenticated connection passed.');}catch(error){console.error('MongoDB: connection failed ('+(error?.codeName||error?.name||'service unavailable')+').');failed=true;}finally{await client.close();}
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
try{const result=await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',{public_id:publicId,overwrite:false,resource_type:'image'});uploaded=true;if(!result.secure_url?.startsWith('https://res.cloudinary.com/'))throw new Error();console.log('Cloudinary: authenticated image upload passed.');}catch(error){console.error('Cloudinary: upload failed (HTTP '+(error?.http_code||'unavailable')+').');failed=true;}finally{if(uploaded){try{await cloudinary.uploader.destroy(publicId,{resource_type:'image'});console.log('Cloudinary: verification image removed.');}catch{console.error('Cloudinary: verification cleanup failed.');failed=true;}}}
process.exitCode=failed?1:0;
