// Run before going live: npm run launch-check
const fs=require('fs'),path=require('path'),S=require('../lib/site'),miss=[],root=path.join(__dirname,'..')
const read=f=>fs.readFileSync(path.join(root,f),'utf8')
if(!/^https:\/\/(?!localhost)/.test(S.url))miss.push('NEXT_PUBLIC_SITE_URL must be your https custom domain')
for(const k of ['legalName','registration','address','email','phone','odpcRegistration'])if(!S[k])miss.push('lib/site.js: '+k+' is empty')
if(/export const DEMO=true/.test(read('lib/data.js')))miss.push('lib/data.js: sample stores and prices are still in use (DEMO=true)')
if(/any details work/.test(read('app/page.js')))miss.push('app/page.js: login and M-Pesa payment are still simulated')
// Secret scan of source files
const pat=[/eyJ[A-Za-z0-9_-]{20,}/,/sk_(live|test)_[A-Za-z0-9]+/,/service_role/i,/BEGIN (RSA |EC )?PRIVATE KEY/,/AKIA[0-9A-Z]{16}/]
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>/^(node_modules|\.next|\.git)$/.test(e.name)?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])
for(const f of walk(root)){const r=path.relative(root,f);if(/\.(png|ico|jpg|webp)$|^(README\.md|scripts\/launch-check\.js|\.env\.example)$/.test(r))continue
 const t=fs.readFileSync(f,'utf8');for(const p of pat)if(p.test(t))miss.push('possible secret in '+r)}
if(miss.length){console.error('NOT READY TO LAUNCH:\n- '+[...new Set(miss)].join('\n- '));process.exit(1)}
console.log('Launch check passed.')
