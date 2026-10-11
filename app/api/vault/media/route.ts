import {vaultStaff} from '../../../vault-security';
import {json,sameOrigin} from '../../../server';
import {uploadImage} from '../../../lib/cloudinary';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(req:Request){if(!sameOrigin(req)||!await vaultStaff())return json({error:'Staff access is required'},403);try{if(Number(req.headers.get('content-length')||0)>4300000)return json({error:'Image must be under 4 MB'},413);const f=(await req.formData()).get('file');if(!(f instanceof File)||f.size>4000000||!['image/jpeg','image/png','image/webp'].includes(f.type))return json({error:'Use a JPEG, PNG, or WebP image under 4 MB'},400);const b=new Uint8Array(await f.arrayBuffer()),valid=f.type==='image/jpeg'?b[0]===255&&b[1]===216:f.type==='image/png'?b[0]===137&&b[1]===80&&b[2]===78:new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP';if(!valid)return json({error:'Invalid image file'},400);const result=await uploadImage(b);return json({url:result.secure_url});}catch{return json({error:'Image upload failed. Please retry.'},503);}}
