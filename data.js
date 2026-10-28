// Sample data flag. While true, the UI says so and hides call/WhatsApp to the placeholder numbers below.
export const DEMO=true
export const TOWNS=['Juja','Thika','Ruiru','Nairobi']
const TK={'Juja-Thika':14,'Juja-Ruiru':12,'Juja-Nairobi':35,'Thika-Ruiru':22,'Thika-Nairobi':42,'Ruiru-Nairobi':20}
const townKm=(a,b)=>a===b?0:(TK[a+'-'+b]??TK[b+'-'+a])
export const HARDWARES=[
 {id:'abc',name:'ABC Hardware',town:'Juja',local:1.2,phone:'254712345678',fee:2000,factor:1},
 {id:'jb',name:'Juja Builders',town:'Juja',local:2.4,phone:'254722111222',fee:2500,factor:.97},
 {id:'kh',name:'Kenyatta Hardware',town:'Juja',local:3.1,phone:'254733456789',fee:2000,factor:1.03},
 {id:'ms',name:'Mega Store',town:'Juja',local:4.8,phone:'254700987654',fee:1500,factor:1.01},
 {id:'tr',name:'Thika Road Hardware',town:'Thika',local:2,phone:'254711222333',fee:2200,factor:.99},
 {id:'rb',name:'Ruiru Build Mart',town:'Ruiru',local:1.5,phone:'254799123456',fee:1800,factor:1.02}]
// stock order: abc, jb, kh, ms, tr, rb
const S=(...a)=>Object.fromEntries(['abc','jb','kh','ms','tr','rb'].map((h,i)=>[h,a[i]]))
export const CATS=['Cement','Steel','Plumbing','Timber','Roofing','Blocks & Bricks']
export const PRODUCTS=[
 {id:1,name:'Bamburi Nguvu Cement',spec:'50kg',unit:'bags',cat:'Cement',base:780,stock:S(500,300,200,40,400,150),kw:['bamburi','nguvu','cement']},
 {id:2,name:'Simba Cement',spec:'50kg',unit:'bags',cat:'Cement',base:750,stock:S(300,200,0,120,250,90),kw:['simba','cement']},
 {id:3,name:'Y12 Steel Bar',spec:'12mm',unit:'pcs',cat:'Steel',base:1200,stock:S(200,150,80,60,100,70),kw:['y12','steel','bar','rebar']},
 {id:4,name:'Y10 Steel Bar',spec:'10mm',unit:'pcs',cat:'Steel',base:850,stock:S(180,100,60,0,90,40),kw:['y10','steel','bar']},
 {id:5,name:'PVC Pipe',spec:'1"',unit:'pcs',cat:'Plumbing',base:350,stock:S(50,80,25,10,60,30),kw:['pvc','pipe','1']},
 {id:6,name:'PVC Pipe',spec:'3"',unit:'pcs',cat:'Plumbing',base:980,stock:S(40,30,20,5,25,15),kw:['pvc','pipe','3']},
 {id:7,name:'Timber Cypress',spec:'3x6',unit:'pcs',cat:'Timber',base:500,stock:S(80,60,45,30,70,20),kw:['timber','cypress','wood']},
 {id:8,name:'Mabati Roofing Sheet',spec:'Gauge 30',unit:'pcs',cat:'Roofing',base:1050,stock:S(120,90,50,0,60,40),kw:['mabati','roofing','sheet','iron']},
 {id:9,name:'Machine-cut Block',spec:'6"',unit:'pcs',cat:'Blocks & Bricks',base:65,stock:S(2000,1500,800,500,1200,900),kw:['block','blocks','stone']}]
let OVP={}
export const price=(p,h)=>OVP[p.id+':'+h.id]??Math.round(p.base*h.factor/5)*5
// Prototype only: owner edits live in the browser. In production only the verified owner may write their own prices and stock (RLS in supabase/schema.sql).
export function applyOverrides(o){OVP=o.price||{};for(const p of PRODUCTS){p.s0=p.s0||{...p.stock};p.stock={...p.s0};for(const h of HARDWARES){const k=p.id+':'+h.id;if(o.stock&&o.stock[k]!=null)p.stock[h.id]=o.stock[k]}}for(const h of HARDWARES){h.f0=h.f0??h.fee;h.fee=o.fee&&o.fee[h.id]!=null?o.fee[h.id]:h.f0}}
export const km=(loc,h)=>+(townKm(loc,h.town)+h.local).toFixed(1)
export const PLANS=[{id:'one',name:'One-time',price:199,span:'1 day',days:1},{id:'week',name:'Weekly',price:499,span:'7 days',days:7},{id:'month',name:'Monthly',price:1499,span:'30 days',days:30},{id:'year',name:'Annual',price:14999,span:'365 days',days:365}]
// Approximate town centres, used to turn GPS coordinates into the nearest supported town
const GEO={Juja:[-1.1018,37.0144],Thika:[-1.0396,37.09],Ruiru:[-1.1476,36.9608],Nairobi:[-1.2921,36.8219]}
export function nearestTown(lat,lng){const r=x=>x*Math.PI/180,d=([a,b])=>{const h=Math.sin(r(a-lat)/2)**2+Math.cos(r(lat))*Math.cos(r(a))*Math.sin(r(b-lng)/2)**2;return 2*Math.asin(Math.sqrt(h))}
 return Object.keys(GEO).sort((x,y)=>d(GEO[x])-d(GEO[y]))[0]}
export const KSH=n=>'KSh '+Math.round(n).toLocaleString('en-KE')
export const TRANSPORT_PER_KM=400

// Calculate: material + transport + delivery per hardware, ranked by availability then total cost
export function compute(cart,loc,hwIds){
 const rows=HARDWARES.filter(h=>!hwIds||hwIds.includes(h.id)).map(h=>{
  const lines=cart.map(c=>{const p=PRODUCTS.find(x=>x.id===c.id);return{p,qty:c.qty,unit:price(p,h),sub:price(p,h)*c.qty,stock:p.stock[h.id],ok:p.stock[h.id]>=c.qty}})
  const material=lines.reduce((s,l)=>s+l.sub,0),d=km(loc,h),transport=Math.round(d*TRANSPORT_PER_KM)
  return{h,lines,material,km:d,transport,delivery:h.fee,total:material+transport+h.fee,inStock:lines.every(l=>l.ok),short:lines.filter(l=>!l.ok)}})
 return rows.sort((a,b)=>b.inStock-a.inStock||a.total-b.total)
}
// "Ask" parser: "I need 100 bags of Bamburi cement near Juja" -> cart items + location
export function parseAsk(text){
 const t=text.toLowerCase(),out=[],used=new Set()
 const parts=t.split(/,| and |\+|&/)
 for(const part of parts){
  const n=(part.match(/(\d+)/)||[])[1],words=part.replace(/[^a-z0-9" ]/g,' ').split(/\s+/)
  let best=null,score=0
  for(const p of PRODUCTS){let s=p.kw.filter(k=>words.includes(k)&&!/^\d$/.test(k)).length;if(part.includes(p.spec.toLowerCase()))s+=1.5;if(s>score){score=s;best=p}}
  if(best&&score>=1&&!used.has(best.id)){used.add(best.id);out.push({id:best.id,qty:+(n&&+n<5000&&!/inch|"/.test(part.slice(part.indexOf(n)+n.length,part.indexOf(n)+n.length+2))?n:10)})}}
 return{items:out,town:TOWNS.find(x=>t.includes(x.toLowerCase()))}
}
export const FAQ=[['How is the total calculated?','Material cost + transport (KSh 400 per km) + the hardware\'s delivery fee.'],['Do I pay the hardware through BuildSmart?','No. You call or WhatsApp the hardware and deal directly with them.'],['How current are the prices?','Prices and stock are entered by each hardware and can change. Always confirm with the store before you buy.']]
