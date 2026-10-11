import {randomBytes,scryptSync} from 'node:crypto';
if(!process.stdin.isTTY){console.error('Run this command in an interactive terminal.');process.exit(1);}
process.stdout.write('Staff password (hidden; minimum 16 characters): ');
process.stdin.setRawMode(true);process.stdin.resume();let password='';
process.stdin.on('data',chunk=>{for(const c of chunk.toString()){if(c==='\u0003')process.exit(130);if(c==='\r'||c==='\n'){process.stdin.setRawMode(false);process.stdin.pause();if(password.length<16){console.error('\nUse at least 16 characters.');process.exit(1);}const salt=randomBytes(16).toString('hex');console.log('\n'+['scrypt',salt,scryptSync(password,salt,64).toString('hex')].join(':'));process.exit(0);}if(c==='\u007f'||c==='\b')password=password.slice(0,-1);else password+=c;}});
