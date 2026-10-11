import {sameOrigin,json} from '../../../server';
import {sessionCookie} from '../../../lib/security';
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'Invalid request origin'},403);const headers=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});headers.append('Set-Cookie',sessionCookie('lag-staff','',0));headers.append('Set-Cookie',sessionCookie('lag-vault','',0));return new Response('{}',{headers});}
