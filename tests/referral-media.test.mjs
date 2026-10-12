import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import ts from 'typescript';

// Exercise the actual route without starting Next's development compiler.
// Authentication and storage are adapters here; publication validation is real.
function load(path,imports){
 const module={exports:{}};
 const source=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(source,{module,exports:module.exports,require(name){if(!(name in imports))throw Error('Unexpected import '+name);return imports[name];},Response,Request,URL,crypto:webcrypto,console});
 return module.exports;
}

test('Referral photographs require a recorded review of the exact public images',async()=>{
 const records=new Map(),events=[];
 let user={email:'admin@example.invalid',role:'Administrator'};
 const db={collection(name){return name==='properties'?{
  async findOne({id}){return records.get(id)||null;},
  async updateOne({id},{$set}){records.set(id,structuredClone($set));}
 }:{async insertOne(event){events.push(event);}};}};
 const data=load('../app/data.ts',{});
 const server=load('../app/server.ts',{'server-only':{},'next/headers':{cookies(){}},'./lib/security':{},'./lib/mongodb':{database:async()=>db},'./data':data});
 const route=load('../app/api/vault/route.ts',{'../../server':server,'../../vault-security':{vaultStaff:async()=>user},'../../lib/mongodb':{transaction:fn=>fn(db,{})},'../../data':data});
 const photo='https://res.cloudinary.com/example/image/upload/catalogue/one.jpg';
 const body={action:'property',status:'Live',permission:'Pending',owner:user.email,public:{title:'Lagos reviewed apartment',zone:'island-core',area:'Victoria Island',type:'Apartment',purpose:'Sale',beds:2,baths:2,guests:0,minimumNights:0,nightly:null,monthly:null,images:[photo],amenities:[],collections:[],rules:[],description:'A Lagos apartment offered subject to viewing and availability confirmation.',availability:'Confirm first',enquiryOnly:true,demo:false},private:{source:'Referral',sourceHandle:'private_supplier',originalPostUrl:'https://www.instagram.com/p/PRIVATE_SOURCE/',mediaStatus:'Reviewed original',mediaDisplayApproved:true,mediaDisplayEvidence:'Owner instruction and visual inspection',mediaApprovedImages:[photo]}};
 const save=async value=>route.POST(new Request('https://lag.example/api/vault',{method:'POST',headers:{origin:'https://lag.example','content-type':'application/json'},body:JSON.stringify(value)}));
 const accepted=await save(body);assert.equal(accepted.status,200);body.id=(await accepted.json()).id;
 const row=records.get(body.id);assert.equal(row.permission,'Pending','Display review must not invent supplier consent');
 assert.ok(!row.public_data.includes('private_supplier'));assert.ok(!row.public_data.includes('mediaDisplayEvidence'));assert.equal(JSON.parse(row.private_data).sourceHandle,'private_supplier');
 assert.equal(events.length,1,'Publication is audited');

 for(const invalid of [
  {...body,public:{...body.public,images:[photo,'https://images.example/new.jpg']}},
  {...body,private:{...body.private,mediaDisplayApproved:false}},
  {...body,private:{...body.private,mediaDisplayEvidence:' '}},
  {...body,private:{...body.private,mediaStatus:'Awaiting clean media'}},
  {...body,permission:'Withdrawn'},
  {...body,public:{...body.public,area:'Abeokuta'}}
 ])assert.equal((await save(invalid)).status,400);
 assert.equal(events.length,1,'Rejected changes are not written');

 user={email:'ops@example.invalid',role:'Operations'};
 const added='https://images.example/new.jpg';
 const operationEdit={...body,public:{...body.public,images:[photo,added]},private:{...body.private,mediaApprovedImages:[photo,added]}};
 assert.equal((await save(operationEdit)).status,400,'Operations cannot approve a newly added image');
 assert.equal(JSON.parse(records.get(body.id).private_data).mediaApprovedImages.length,1);

 user={email:'admin@example.invalid',role:'Administrator'};
 assert.equal((await save({...body,private:{...body.private,mediaStatus:'Reviewed edited'}})).status,200);
 const legacy={...body,permission:'Approved',private:{...body.private,mediaDisplayApproved:false,permissionEvidence:'Recorded supplier permission',mediaStatus:'Clean and approved'}};
 assert.equal((await save(legacy)).status,200,'Previously approved supplier photography remains valid');
 assert.equal((await save({...legacy,permission:'Pending'})).status,400,'Supplier path requires supplier approval');
});
