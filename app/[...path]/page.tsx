import PublicApp from '../public-app';
import {catalogue} from '../server';
import {notFound} from 'next/navigation';
const allowed=['stays','areas','collections','monthly','new','saved','property','privacy','terms','contact'];
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{path:string[]}>}){const {path}=await params;const stays=await catalogue();const stay=path[0]==='property'?stays.find(s=>s.slug===path[1]):null;return {title:(stay?stay.title:path[0].charAt(0).toUpperCase()+path[0].slice(1))+' | LAG Shortlets',description:stay?stay.title+' in '+stay.area+'. Explore the space and request availability.':'Discover considered stays across Lagos with LAG Shortlets.'};}
export default async function Page({params}:{params:Promise<{path:string[]}>}){const {path}=await params;if(!allowed.includes(path[0]))notFound();const stays=await catalogue();if(path[0]==='property'&&!stays.some(s=>s.slug===path[1]))notFound();return <PublicApp stays={stays} path={'/'+path.join('/')}/>;}
