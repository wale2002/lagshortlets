import PublicApp from './public-app';
import {catalogue} from './server';
export const dynamic='force-dynamic';
export default async function Home(){return <PublicApp stays={await catalogue()} path="/"/>;}
