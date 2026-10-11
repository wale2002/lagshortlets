import {staff} from '../server';
import {vaultStaff} from '../vault-security';
import VaultApp from './vault-app';
import Login from './login';
export const dynamic='force-dynamic';
export const metadata={title:'LAG Vault | Private operations',robots:{index:false,follow:false}};
export default async function Vault(){const user=await staff();if(!user)return <Login/>;return <VaultApp role={user.role} email={user.email} verified={Boolean(await vaultStaff())}/>;}
