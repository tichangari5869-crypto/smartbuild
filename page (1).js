'use client'
import {useState,useEffect,useMemo} from 'react'
import {DEMO,applyOverrides,TOWNS,HARDWARES,PRODUCTS,CATS,PLANS,KSH,compute,parseAsk,price,km,FAQ,nearestTown} from '../lib/data'

const useLS=(k,d)=>{const[v,s]=useState(d);useEffect(()=>{try{const x=localStorage.getItem(k);if(x)s(JSON.parse(x))}catch{}},[k]);return[v,n=>{s(n);try{localStorage.setItem(k,JSON.stringify(n))}catch{}}]}
const Stock=({n})=><span className={'text-xs font-semibold px-2 py-0.5 rounded-md '+(n===0?'bg-red-100 text-red-700':n<30?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700')}>{n===0?'Out of stock':n<30?'Low stock':'In stock'}</span>

const Tel=({ph,className,children})=>DEMO?<span className="btn bg-slate-200 text-slate-600 !py-2 text-sm">{children} (sample)</span>:<a href={'tel:+'+ph} className={className}>{children}</a>
const Wa=({href,className,children})=>DEMO?<span className="btn bg-slate-200 text-slate-600 !py-2 text-sm">{children} (sample)</span>:<a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
const Notice=()=>DEMO?<p role="note" className="bg-amber-100 text-amber-900 text-sm px-4 py-2">Sample data for testing. Stores, prices and stock shown here are not real.</p>:null

const PwField=({id,label,value,onChange,auto})=>{const[show,setShow]=useState(false)
 return<div><label htmlFor={id} className="text-sm font-medium">{label}</label><div className="relative mt-1"><input id={id} maxLength={128} className="inp pr-20" type={show?'text':'password'} autoComplete={auto} value={value} onChange={onChange}/>
  <button type="button" onClick={()=>setShow(!show)} aria-label={(show?'Hide':'Show')+' password'} className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold text-buyer">{show?'Hide':'Show'}</button></div></div>}

function Shell({title,back,children,right,wide}){return<div className="min-h-screen pb-24">
 <header className="sticky top-0 z-10 bg-buyer text-white"><div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
  {back&&<button aria-label="Back" onClick={back} className="text-2xl leading-none px-2">‹</button>}
  <h1 className="font-bold flex-1">{title}</h1>{right}</div></header>
 <Notice/>
 <main className={'p-4 mx-auto '+(wide?'max-w-6xl grid gap-4 content-start sm:grid-cols-2 lg:grid-cols-3 [&>*:not(.card)]:col-span-full':'max-w-xl space-y-4')}>{children}</main></div>}

export default function App(){
 const[screen,go]=useState('home'),[user,setUser]=useLS('bs_user',null),[stored,setPlan]=useLS('bs_plan',null)
 const[loc,setLoc]=useLS('bs_loc','Juja'),[cart,setCart]=useState([]),[hist,setHist]=useLS('bs_hist',[]),[saved,setSaved]=useLS('bs_saved',{hw:[],mat:[]})
 const[pending,setPending]=useState(null),[hwFilter,setHwFilter]=useState(null),[mode,setMode]=useState('login'),[choice,setChoice]=useState('month')
  const[owner,setOwner]=useLS('bs_owner',null),[ovRaw,setOv]=useLS('bs_ov',{}),[note,setNote]=useState(''),[resetFor,setResetFor]=useState('buyer')
 const ov={price:{},stock:{},fee:{},...ovRaw};applyOverrides(ov)
 // A plan only counts once paid, and stops counting when it expires
 const plan=stored&&stored.paid&&(stored.ends||Infinity)>Date.now()?stored:null
 const needAuth=(next)=>go(!user?'auth':!plan?'plan':next)
 const start=(m)=>{setMode(m);if(!user){setPending('start');go('auth')}else if(!plan)go('plan');else go('dashboard')}
 const addItem=(id,qty=10)=>setCart(c=>c.find(x=>x.id===id)?c:[...c,{id,qty}])
 const P={resetFor,setResetFor,owner,setOwner,ov,setOv,note,setNote,screen,go,user,setUser,plan,setPlan,choice,setChoice,loc,setLoc,cart,setCart,addItem,hist,setHist,saved,setSaved,hwFilter,setHwFilter,mode,setMode,start}
 useEffect(()=>{document.title=({home:'BuildSmart | Compare building material prices',auth:'Log in or sign up | BuildSmart',plan:'Choose a plan | BuildSmart',pay:'Payment | BuildSmart',dashboard:'Dashboard | BuildSmart',location:'Set your location | BuildSmart',ask:'Describe what you need | BuildSmart',catalog:'Search materials | BuildSmart',hardwares:'Hardware near you | BuildSmart',qty:'Quantities | BuildSmart',result:'Your recommendation | BuildSmart',history:'Past calculations | BuildSmart',reset:'Reset your password | BuildSmart',newpw:'Choose a new password | BuildSmart',hwauth:'Hardware owner login | BuildSmart',hwdash:'Manage your store | BuildSmart'})[screen]||'BuildSmart'},[screen])
 const S={home:Home,auth:Auth,plan:Plan,pay:Pay,dashboard:Dash,location:Loc,ask:Ask,catalog:Catalog,hardwares:Hardwares,qty:Qty,result:Result,history:History,reset:Reset,newpw:NewPw,hwauth:HwAuth,hwdash:HwDash}[screen]
 return<S {...P}/>}

function Home({start,go}){return<main className="max-w-xl mx-auto min-h-screen">
 <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white px-5 pt-8 pb-10 rounded-b-3xl">
  <p className="font-bold text-lg">BuildSmart</p>
  <h1 className="text-3xl font-extrabold mt-6 leading-tight">Before you buy building materials, check here.</h1>
  <p className="text-slate-300 mt-3">Compare hardware prices near you, add transport and delivery, and see what your project may cost.</p>
  <div className="mt-5 bg-white rounded-xl p-1.5 flex"><button onClick={()=>start('login')} className="flex-1 px-3 text-left text-slate-600 text-sm">What do you need? e.g. Bamburi cement 50kg</button><button onClick={()=>start('login')} className="btn bg-buyer text-white !py-2">Check price</button></div></div>
 <Notice/>
 <div className="p-4 space-y-3 -mt-5">
  <p className="text-center text-sm text-slate-600 pt-6">Choose your login type</p>
  <button onClick={()=>start('login')} className="btn bg-buyer text-white w-full !py-5 text-lg">Individual (Buyer)</button>
  <button onClick={()=>go('hwauth')} className="btn bg-supplier text-white w-full !py-5 text-lg">Hardware portal (store owners)</button>
  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-3">
   <button onClick={()=>start('signup')} className="card text-sm text-buyer font-semibold">New here?<br/>Create Individual Account (Free)</button>
   <div className="card text-sm text-slate-600">Hardware owner?<br/>Registration opens soon</div></div>
  <div className="card grid grid-cols-2 gap-2 text-sm">{['Compare nearby hardware prices','Totals include transport and delivery','Call or WhatsApp the store','You pay the hardware directly'].map(t=><p key={t}>{t}</p>)}</div>
  <nav aria-label="Legal" className="text-center text-xs text-slate-600 pt-4 flex justify-center gap-4"><a className="underline" href="/privacy">Privacy</a><a className="underline" href="/terms">Terms</a><a className="underline" href="/cookies">Cookies</a><a className="underline" href="/refund">Refunds</a></nav></div></main>}

function Auth({mode,setMode,setUser,plan,go,note,setNote,setResetFor}){
 const[f,setF]=useState({name:'',id:'',pw:''}),[err,setErr]=useState(''),[agree,setAgree]=useState(false)
 const done=u=>{setNote('');setUser(u);go(plan?'dashboard':'plan')}
 const sub=()=>{if(!f.id||f.pw.length<8)return setErr('Enter your email or phone and a password of at least 8 characters.');if(mode==='signup'&&!f.name)return setErr('Enter your name.');if(mode==='signup'&&!agree)return setErr('Please accept the Terms and Privacy Policy to create an account.');done({name:f.name||'there',id:f.id})}
 return<Shell title={mode==='login'?'Individual login':'Create account'} back={()=>go('home')}>
  {note&&<p role="status" className="card text-sm">{note}</p>}
  <div className="grid grid-cols-2 bg-slate-200 rounded-xl p-1">{['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} className={'py-2 rounded-lg font-semibold '+(mode===m?'bg-white text-buyer':'text-slate-600')}>{m==='login'?'Log in':'Sign up'}</button>)}</div>
  <div className="card space-y-3">
   {mode==='signup'&&<div><label htmlFor="nm" className="text-sm font-medium">Full name</label><input id="nm" maxLength={100} className="inp mt-1" autoComplete="name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>}
   <div><label htmlFor="id" className="text-sm font-medium">Email or phone number</label><input id="id" maxLength={100} className="inp mt-1" autoComplete="username" value={f.id} onChange={e=>setF({...f,id:e.target.value})}/></div>
   <PwField id="pw" label="Password (8 or more characters)" value={f.pw} onChange={e=>setF({...f,pw:e.target.value})} auto={mode==='login'?'current-password':'new-password'}/>
   {mode==='login'&&<button type="button" onClick={()=>{setResetFor('buyer');setNote('');go('reset')}} className="text-sm underline text-buyer self-start text-left">Forgot password?</button>}
   {mode==='signup'&&<label className="flex gap-2 text-sm items-start"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-1 w-4 h-4"/><span>I agree to the <a className="underline text-buyer" href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> and have read the <a className="underline text-buyer" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</span></label>}
   {err&&<p role="alert" className="text-sm text-red-600">{err}</p>}
   <button onClick={sub} className="btn bg-buyer text-white w-full">{mode==='login'?'Log in':'Create account'}</button></div>
  <p className="text-xs text-slate-600 text-center">Prototype: any details work. Production uses Supabase Auth (email, phone OTP, Google).</p></Shell>}

function Plan({go,setChoice}){const[sel,setSel]=useState('month')
 return<Shell title="Choose your plan" back={()=>go('home')}>
  <p className="text-slate-600">Get full access to price comparison and recommendations.</p>
  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-3">{PLANS.map(p=><button key={p.id} aria-pressed={sel===p.id} onClick={()=>setSel(p.id)} className={'card text-left relative '+(sel===p.id?'!border-buyer ring-2 ring-buyer':'')}>
   <p className="font-semibold">{p.name}</p><p className="text-2xl font-extrabold">{KSH(p.price)}</p><p className="text-xs text-slate-600">{p.span} access</p></button>)}</div>
  <button onClick={()=>{setChoice(sel);go('pay')}} className="btn bg-buyer text-white w-full">Continue to payment</button></Shell>}

function Pay({choice,go,setPlan}){
 const pl=PLANS.find(p=>p.id===choice)||PLANS[2],[ph,setPh]=useState(''),[st,setSt]=useState('idle')
 const pay=()=>{if(!/^(07|01|254)\d{7,9}$/.test(ph))return setSt('bad');setSt('wait');
  // Production: POST /api/mpesa/stk -> Daraja STK push -> callback updates payments + subscriptions in Supabase
  setTimeout(()=>{setPlan({id:pl.id,receipt:'SAMPLE-'+Math.random().toString(36).slice(2,9).toUpperCase(),paid:Date.now(),ends:Date.now()+pl.days*864e5});go('dashboard')},3000)}
 return<Shell title="Make payment" back={()=>go('plan')}>
  <div className="card flex justify-between"><span>{pl.name} plan ({pl.span})</span><b>{KSH(pl.price)}</b></div>
  <div className="card space-y-3"><label htmlFor="ph" className="text-sm font-medium">M-Pesa phone number</label><input id="ph" maxLength={15} placeholder="0712345678" autoComplete="tel" className="inp" value={ph} onChange={e=>setPh(e.target.value)} inputMode="tel"/>
   {st==='bad'&&<p role="alert" className="text-sm text-red-600">Enter a valid Safaricom number, e.g. 0712345678.</p>}
   {st==='wait'?<div className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">STK push sent to {ph}. Enter your M-Pesa PIN on your phone… (simulated)</div>:<button onClick={pay} className="btn bg-supplier text-white w-full">Pay {KSH(pl.price)} with M-Pesa</button>}</div></Shell>}

function Dash({user,plan,loc,go,hist,saved,setUser,setPlan,setCart,setHwFilter}){
 const pl=PLANS.find(p=>p.id===plan?.id)
 const Q=({l,c,to})=><button onClick={()=>{setCart([]);setHwFilter(null);go(to)}} className={'btn text-white text-left flex-1 '+c}>{l}</button>
 return<Shell title={`Hello, ${user?.name?.split(' ')[0]}`} right={<button className="text-sm underline" onClick={()=>{setUser(null);setPlan(null);go('home')}}>Log out</button>}>
  <div className="card flex justify-between items-center"><div><p className="text-xs text-slate-600">Subscription</p><p className="font-semibold">{pl?.name} • {plan?.ends?Math.max(1,Math.ceil((plan.ends-Date.now())/864e5))+' day(s) left':'active'}</p></div></div>
  <button onClick={()=>go('location')} className="card w-full flex justify-between"><span>Location: <b>{loc}</b></span><span className="text-buyer text-sm font-semibold">Change</span></button>
  <p className="font-semibold">Start here</p>
  <div className="grid gap-3"><Q l="Ask: tell us what you need" c="bg-buyer" to="ask"/><Q l="Browse all materials" c="bg-blue-700" to="catalog"/><Q l="Browse hardware and choose" c="bg-slate-700" to="hardwares"/></div>
  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-3 text-sm">
   <button onClick={()=>go('history')} className="card text-left">Past calculations<br/><b>{hist.length}</b></button>
   <div className="card">Saved hardware<br/><b>{saved.hw.length}</b> • materials <b>{saved.mat.length}</b></div></div>
  <div className="card"><p className="font-semibold mb-2">Recent calculations</p>{hist.slice(0,3).map((h,i)=><p key={i} className="text-sm flex justify-between"><span>{h.label}</span><b>{KSH(h.total)}</b></p>)}{!hist.length&&<p className="text-sm text-slate-600">Nothing yet. Pick a starting option above to calculate your first project.</p>}</div></Shell>}

function Loc({loc,setLoc,go}){const[msg,setMsg]=useState('')
 const gps=()=>{if(!navigator.geolocation)return setMsg('Location is not available. Pick your town below.');setMsg('Finding you…')
  navigator.geolocation.getCurrentPosition(p=>{const t=nearestTown(p.coords.latitude,p.coords.longitude);setLoc(t);setMsg('Nearest town: '+t+'. Not right? Pick another below.')},()=>setMsg('Allow location access, or pick your town below.'),{timeout:10000})}
 return<Shell title="Where is your site?" back={()=>go('dashboard')}>
  <button onClick={gps} className="btn bg-buyer text-white w-full">Use my location</button>{msg&&<p className="text-sm text-slate-600">{msg}</p>}
  <div className="card space-y-2"><p className="text-sm font-medium">Or choose a town</p>{TOWNS.map(t=><button key={t} onClick={()=>{setLoc(t);go('dashboard')}} className={'btn w-full border text-left '+(loc===t?'border-buyer bg-blue-50 text-buyer':'border-slate-200')}>{t}{loc===t&&' (selected)'}</button>)}</div>
  <p className="text-xs text-slate-600">Your location sets nearby hardware, transport cost and recommendations everywhere.</p></Shell>}


function Ask({go,setCart,setLoc,loc}){const[t,setT]=useState(''),[r,setR]=useState(null),[faq,setF]=useState(null)
 const run=()=>{const x=parseAsk(t);setR(x)}
 return<Shell title="Tell us what you need" back={()=>go('dashboard')}>
  <div className="card space-y-3"><textarea aria-label="Describe what you need" className="inp" rows={3} value={t} onChange={e=>setT(e.target.value)} placeholder="e.g. I need 100 bags of Bamburi cement and 20 Y12 steel bars near Juja"/>
   <div className="flex flex-wrap gap-2">{['100 bags of Bamburi cement near Juja','50 Simba cement, 30 Y12 steel bar','10 PVC pipe 3" and 20 mabati'].map(s=><button key={s} onClick={()=>setT(s)} className="text-xs bg-blue-50 text-buyer rounded-md px-3 py-1">{s}</button>)}</div>
   <button onClick={run} className="btn bg-buyer text-white w-full">Understand my request</button></div>
  {r&&(r.items.length?<div className="card border-buyer space-y-2"><p className="font-semibold">We understood:</p>
   {r.items.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return<p key={i.id} className="text-sm">• {p.name} {p.spec} × <b>{i.qty} {p.unit}</b></p>})}
   <p className="text-sm">• Location: <b>{r.town||loc}</b></p>
   <button onClick={()=>{setCart(r.items);if(r.town)setLoc(r.town);go('qty')}} className="btn bg-buyer text-white w-full">Confirm and set quantities</button></div>
  :<p role="alert" className="text-sm text-red-600">We couldn't find a material in that. Try a brand and size, like “Bamburi cement 50kg”, or browse all materials.</p>)}
  <div className="card"><p className="font-semibold mb-2">Common questions</p>{FAQ.map(([q,a],i)=><div key={i} className="border-t first:border-0 py-2"><button className="text-left text-sm font-medium w-full" onClick={()=>setF(faq===i?null:i)}>{q}</button>{faq===i&&<p className="text-sm text-slate-600 mt-1">{a}</p>}</div>)}</div></Shell>}

function Catalog({go,cart,setCart,addItem,hwFilter,setHwFilter,loc,saved,setSaved}){
 const[q,setQ]=useState(''),[cat,setCat]=useState('All'),hw=HARDWARES.find(h=>h.id===hwFilter)
 const list=PRODUCTS.filter(p=>(cat==='All'||p.cat===cat)&&(p.name+' '+p.spec).toLowerCase().includes(q.toLowerCase())&&(!hw||p.stock[hw.id]>=0))
 const toggle=id=>setSaved({...saved,mat:saved.mat.includes(id)?saved.mat.filter(x=>x!==id):[...saved.mat,id]})
 return<Shell wide title={hw?hw.name:'Search materials'} back={()=>go(hw?'hardwares':'dashboard')}>
  <input aria-label="Search materials" className="inp" placeholder="Search e.g. Bamburi Cement 50kg, PVC Pipe 3&quot;" value={q} onChange={e=>setQ(e.target.value)}/>
  <div className="flex gap-2 overflow-x-auto pb-1">{['All',...CATS].map(c=><button key={c} onClick={()=>setCat(c)} className={'whitespace-nowrap rounded-md px-3 py-1 text-sm border '+(cat===c?'bg-buyer text-white border-buyer':'bg-white border-slate-300')}>{c}</button>)}</div>
  {list.map(p=>{const rows=HARDWARES.filter(h=>!hw||h.id===hw.id).map(h=>({h,pr:price(p,h),d:km(loc,h)})).sort((a,b)=>a.pr-b.pr),low=rows[0],on=cart.some(c=>c.id===p.id)
   return<div key={p.id} className="card flex gap-3 items-center"><div className="flex-1"><p className="font-semibold">{p.name} <span className="text-slate-600 font-normal">{p.spec}</span></p>
    <p className="text-sm text-slate-600">{hw?'Price':'From'} <b className="text-buyer">{KSH(low.pr)}</b> / {p.unit.replace(/s$/,'')} {!hw&&<>at {low.h.name}</>}</p>
    {hw&&<Stock n={p.stock[hw.id]}/>}</div>
    <button className="text-sm text-buyer underline" onClick={()=>toggle(p.id)}>{saved.mat.includes(p.id)?'Saved':'Save'}</button>
    <button onClick={()=>on?setCart(cart.filter(c=>c.id!==p.id)):addItem(p.id)} className={'btn !py-2 text-sm '+(on?'bg-green-100 text-green-700':'bg-buyer text-white')}>{on?'Added':'Add'}</button></div>})}
  {!list.length&&<p className="text-center text-slate-600">No materials match. Try a brand name like “Bamburi” or clear the category.</p>}
  {cart.length>0&&<div className="fixed bottom-0 inset-x-0 max-w-xl mx-auto p-3 bg-white border-t"><button onClick={()=>go('qty')} className="btn bg-buyer text-white w-full">Enter quantities ({cart.length} selected)</button></div>}</Shell>}

function Hardwares({go,loc,setHwFilter,saved,setSaved}){
 const list=HARDWARES.map(h=>({...h,d:km(loc,h)})).sort((a,b)=>a.d-b.d)
 return<Shell wide title={`Hardware near ${loc}`} back={()=>go('dashboard')}>
  {list.map(h=><div key={h.id} className="card space-y-2"><div className="flex justify-between"><p className="font-semibold">{h.name}</p>
   <button className="text-sm text-buyer underline" onClick={()=>setSaved({...saved,hw:saved.hw.includes(h.id)?saved.hw.filter(x=>x!==h.id):[...saved.hw,h.id]})}>{saved.hw.includes(h.id)?'Saved':'Save'}</button></div>
   <p className="text-sm text-slate-600">{h.town} • {h.d} km • Delivery from {KSH(h.fee)}</p>
   <div className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2"><button onClick={()=>{setHwFilter(h.id);go('catalog')}} className="btn bg-buyer text-white !py-2 text-sm">View products</button>
    <Tel ph={h.phone} className="btn bg-supplier text-white !py-2 text-sm">Call</Tel><Wa href={`https://wa.me/${h.phone}`} className="btn border border-supplier text-supplier !py-2 text-sm">WhatsApp</Wa></div></div>)}</Shell>}

function Qty({cart,setCart,go}){
 const set=(id,qty)=>setCart(cart.map(c=>c.id===id?{...c,qty:Math.min(100000,Math.max(1,Math.floor(+qty)||1))}:c))
 return<Shell title="Enter quantities" back={()=>go('catalog')}>
  {cart.map(c=>{const p=PRODUCTS.find(x=>x.id===c.id),s=p.base<100?100:10;return<div key={c.id} className="card flex flex-wrap items-center gap-3"><div className="flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-slate-600">{p.spec} • {p.unit}</p></div>
   <button aria-label={'Decrease '+p.name} className="w-11 h-11 rounded-lg bg-slate-100 text-lg" onClick={()=>set(c.id,c.qty-s)}>−</button><input aria-label={'Quantity of '+p.name} value={c.qty} onChange={e=>set(c.id,e.target.value)} inputMode="numeric" className="w-16 text-center inp !px-1"/><button aria-label={'Increase '+p.name} className="w-11 h-11 rounded-lg bg-slate-100 text-lg" onClick={()=>set(c.id,c.qty+s)}>+</button>
   <button aria-label="Remove" onClick={()=>setCart(cart.filter(x=>x.id!==c.id))} className="text-red-700 text-sm underline">Remove</button></div>})}
  <button onClick={()=>go('catalog')} className="btn border border-dashed border-buyer text-buyer w-full">+ Add more materials</button>
  <button disabled={!cart.length} onClick={()=>go('result')} className="btn bg-buyer text-white w-full disabled:opacity-40">Calculate total cost</button></Shell>}

function Result(p){return p.cart.length?<ResultView {...p}/>:<Shell title="Your recommendation" back={()=>p.go('dashboard')}><p className="card text-slate-600">Nothing to calculate yet. Add some materials first.</p></Shell>}
function ResultView({cart,loc,go,hist,setHist,saved,setSaved,hwFilter}){
 const rows=useMemo(()=>compute(cart,loc,hwFilter?[hwFilter]:null),[cart,loc,hwFilter]),best=rows[0],[open,setOpen]=useState(null),[ok,setOk]=useState(false)
 const[sort,setSort]=useState('best'),list=useMemo(()=>sort==='best'?rows:[...rows].sort((a,b)=>sort==='cheap'?a.material-b.material:a.km-b.km),[rows,sort]),label=cart.map(c=>`${c.qty} ${PRODUCTS.find(p=>p.id===c.id).name.split(' ')[0]}`).join(' + ')
 const wa=`https://wa.me/${best.h.phone}?text=${encodeURIComponent(`Hello ${best.h.name}, I found you on BuildSmart. I need: ${cart.map(c=>{const p=PRODUCTS.find(x=>x.id===c.id);return`${c.qty} ${p.unit} ${p.name} ${p.spec}`}).join(', ')}. Delivery to ${loc}. Is it available?`)}`
 const Row=({r,i})=><div className="card"><button className="w-full flex justify-between text-left" onClick={()=>setOpen(open===i?null:i)}><span><b>{r.h.name}</b><br/><span className="text-xs text-slate-600">{r.km} km • {r.inStock?'All in stock':'Short on '+r.short.length+' item(s)'}</span></span><b className={r.inStock?'':'text-slate-600'}>{KSH(r.total)}</b></button>
  {open===i&&<div className="mt-2 text-sm space-y-1 border-t pt-2">{r.lines.map(l=><p key={l.p.id} className="flex justify-between"><span>{l.qty} × {l.p.name} {l.p.spec} @ {KSH(l.unit)}</span><span>{KSH(l.sub)} <Stock n={l.stock<l.qty?0:l.stock}/></span></p>)}<p className="flex justify-between"><span>Transport ({r.km} km)</span>{KSH(r.transport)}</p><p className="flex justify-between"><span>Delivery</span>{KSH(r.delivery)}</p></div>}</div>
 return<Shell title="Your recommendation" back={()=>go('qty')}>
  {!best.inStock&&<p className="card text-amber-700 bg-amber-50">No hardware has everything in stock. Showing the closest match. Reduce quantities or call to confirm.</p>}
  <div className="card !border-buyer bg-blue-50 space-y-3"><p className="text-sm font-semibold text-buyer">Best overall choice</p><p className="text-xl font-extrabold">{best.h.name}, {best.h.town}</p>
   <div className="text-sm space-y-1"><p className="flex justify-between"><span>Material cost</span><b>{KSH(best.material)}</b></p><p className="flex justify-between"><span>Transport ({best.km} km)</span><b>{KSH(best.transport)}</b></p><p className="flex justify-between"><span>Delivery</span><b>{KSH(best.delivery)}</b></p><p className="flex justify-between text-lg border-t pt-1"><span>Total estimated cost</span><b className="text-buyer">{KSH(best.total)}</b></p></div>
   <p className="text-xs text-slate-600">{best.inStock?'Lowest total cost among hardware with enough stock':''}{rows[1]&&best.inStock?` • saves ${KSH(rows.find(r=>r.inStock&&r!==best)?.total-best.total||0)} vs next best`:''}</p>
   <div className="grid grid-cols-2 gap-2"><Tel ph={best.h.phone} className="btn bg-buyer text-white">Call</Tel><Wa href={wa} className="btn bg-supplier text-white">WhatsApp</Wa></div></div>
  <button onClick={()=>{setHist([{label,total:best.total,store:best.h.name,date:new Date().toLocaleDateString('en-KE')},...hist].slice(0,50));setOk(true)}} className="btn border border-buyer text-buyer w-full">{ok?'Saved to history':'Save this calculation'}</button>
  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">Compare all hardware</p><div className="flex flex-wrap gap-1 text-xs">{[['best','Best'],['cheap','Lowest price'],['near','Nearest']].map(([k,l])=><button key={k} onClick={()=>{setSort(k);setOpen(null)}} className={'rounded-md px-3 py-1 border '+(sort===k?'bg-buyer text-white border-buyer':'bg-white border-slate-300')}>{l}</button>)}</div></div>{list.map((r,i)=><Row key={r.h.id} r={r} i={i}/>)}
  <p className="text-xs text-slate-600">Estimates. Transport is KSh 400/km. You pay the hardware directly.</p></Shell>}

function History({hist,go}){return<Shell wide title="Past calculations" back={()=>go('dashboard')}>
 {hist.map((h,i)=><div key={i} className="card flex justify-between"><span><b>{h.label}</b><br/><span className="text-xs text-slate-600">{h.store} • {h.date}</span></span><b>{KSH(h.total)}</b></div>)}
 {!hist.length&&<p className="text-center text-slate-600">No saved calculations yet. Calculate a project and tap Save.</p>}</Shell>}

function Reset({go,resetFor}){const hw=resetFor==='hw',btn=hw?'bg-supplier':'bg-buyer',backTo=hw?'hwauth':'auth'
 const[id,setId]=useState(''),[sent,setSent]=useState(false),[err,setErr]=useState('')
 // Production: supabase.auth.resetPasswordForEmail(id), then supabase.auth.updateUser({password}) on the link page. Links are single use and expire.
 return<Shell title={hw?'Reset store password':'Reset your password'} back={()=>go(backTo)}>
  {sent?<div className="card space-y-3"><p className="font-semibold">Check your email or phone</p><p className="text-sm">If an account exists for <b>{id}</b>, we have sent a reset link. It works once and expires in 30 minutes.</p><p className="text-sm text-slate-600">Demo only: no message is sent. Use the button below to open the link.</p><button onClick={()=>go('newpw')} className={'btn text-white w-full '+btn}>Open reset link (demo)</button></div>
  :<div className="card space-y-3"><div><label htmlFor="rid" className="text-sm font-medium">Email or phone number</label><input id="rid" maxLength={100} autoComplete="username" className="inp mt-1" value={id} onChange={e=>setId(e.target.value)}/></div>{err&&<p role="alert" className="text-sm text-red-700">{err}</p>}<button onClick={()=>id.trim()?setSent(true):setErr('Enter the email or phone number you signed up with.')} className={'btn text-white w-full '+btn}>Send reset link</button></div>}</Shell>}

function NewPw({go,setMode,setNote,resetFor}){const hw=resetFor==='hw',btn=hw?'bg-supplier':'bg-buyer'
 const[a,setA]=useState(''),[b,setB]=useState(''),[err,setErr]=useState('')
 const save=()=>{if(a.length<8)return setErr('Use at least 8 characters.');if(a!==b)return setErr('The two passwords do not match.');setNote('Password changed. Log in with your new password.');if(hw)go('hwauth');else{setMode('login');go('auth')}}
 return<Shell title="Choose a new password" back={()=>go(hw?'hwauth':'auth')}><div className="card space-y-3">
  <PwField id="np" label="New password (8 or more characters)" value={a} onChange={e=>setA(e.target.value)} auto="new-password"/>
  <PwField id="np2" label="Repeat new password" value={b} onChange={e=>setB(e.target.value)} auto="new-password"/>
  {err&&<p role="alert" className="text-sm text-red-700">{err}</p>}<button onClick={save} className={'btn text-white w-full '+btn}>Save new password</button></div></Shell>}

function HwAuth({go,setOwner,setResetFor,note,setNote}){const[f,setF]=useState({id:'',pw:'',store:'abc'}),[err,setErr]=useState('')
 const sub=()=>{if(!f.id.trim()||f.pw.length<8)return setErr('Enter your email or phone and a password of at least 8 characters.');setNote('');setOwner(f.store);go('hwdash')}
 return<Shell title="Hardware owner login" back={()=>go('home')}>{note&&<p role="status" className="card text-sm">{note}</p>}<div className="card space-y-3">
  <p className="text-sm text-slate-600">Prototype: any details work. Pick which sample store is yours. In production you see only your own store, and only after we verify it.</p>
  <div><label htmlFor="os" className="text-sm font-medium">Your store</label><select id="os" className="inp mt-1" value={f.store} onChange={e=>setF({...f,store:e.target.value})}>{HARDWARES.map(h=><option key={h.id} value={h.id}>{h.name}, {h.town}</option>)}</select></div>
  <div><label htmlFor="hid" className="text-sm font-medium">Email or phone number</label><input id="hid" maxLength={100} autoComplete="username" className="inp mt-1" value={f.id} onChange={e=>setF({...f,id:e.target.value})}/></div>
  <PwField id="hpw" label="Password (8 or more characters)" value={f.pw} onChange={e=>setF({...f,pw:e.target.value})} auto="current-password"/>
  <button type="button" onClick={()=>{setResetFor('hw');setNote('');go('reset')}} className="text-sm underline text-supplier self-start text-left">Forgot password?</button>
  {err&&<p role="alert" className="text-sm text-red-700">{err}</p>}<button onClick={sub} className="btn bg-supplier text-white w-full">Log in to my store</button></div></Shell>}

function HwDash({owner,setOwner,ov,setOv,go}){
 const h=HARDWARES.find(x=>x.id===owner)
 const[d,setD]=useState(()=>h?Object.fromEntries(PRODUCTS.map(p=>[p.id,{price:String(price(p,h)),stock:String(p.stock[h.id])}])):{}),[fee,setFee]=useState(h?String(h.fee):''),[msg,setMsg]=useState(null)
 if(!h)return<HwAuth go={go} setOwner={setOwner}/>
 const set=(id,k,v)=>setD({...d,[id]:{...d[id],[k]:v}}),whole=(s,lo,hi)=>s.trim()!==''&&Number.isInteger(+s)&&+s>=lo&&+s<=hi
 const save=()=>{const np={},ns={}
  for(const p of PRODUCTS){const x=d[p.id];if(!whole(x.price,1,1e6)||!whole(x.stock,0,1e6))return setMsg({bad:1,t:`Check ${p.name} ${p.spec}: price must be a whole number above 0 and stock a whole number from 0.`});np[p.id+':'+h.id]=+x.price;ns[p.id+':'+h.id]=+x.stock}
  if(!whole(fee,0,1e5))return setMsg({bad:1,t:'Delivery fee must be a whole number from 0 to 100,000.'})
  setOv({price:{...ov.price,...np},stock:{...ov.stock,...ns},fee:{...ov.fee,[h.id]:+fee}});setMsg({t:'Saved. Buyers now see these prices and stock.'})}
 const out=()=>{setOwner(null);go('home')}
 return<Shell title={h.name} right={<button className="text-sm underline" onClick={out}>Log out</button>}>
  <div className="card"><p className="text-xs text-slate-600">Store owner (prototype)</p><p className="font-semibold">{h.name}, {h.town}</p><p className="text-sm text-slate-600">Change a price or stock level, then save. Buyers see it straight away.</p></div>
  <div className="card"><label htmlFor="fee" className="text-sm font-medium">Delivery fee (KSh)</label><input id="fee" inputMode="numeric" className="inp mt-1" value={fee} onChange={e=>setFee(e.target.value)}/></div>
  <div className="card"><p className="font-semibold">Prices and stock</p>{PRODUCTS.map(p=><div key={p.id} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-2 border-t pt-3 mt-3">
   <p className="col-span-full font-semibold">{p.name} <span className="font-normal text-slate-600">{p.spec}, per {p.unit.replace(/s$/,'')}</span></p>
   <div><label htmlFor={'pr'+p.id} className="text-xs text-slate-600">Price (KSh)</label><input id={'pr'+p.id} inputMode="numeric" className="inp" value={d[p.id].price} onChange={e=>set(p.id,'price',e.target.value)}/></div>
   <div><label htmlFor={'sk'+p.id} className="text-xs text-slate-600">In stock</label><input id={'sk'+p.id} inputMode="numeric" className="inp" value={d[p.id].stock} onChange={e=>set(p.id,'stock',e.target.value)}/></div></div>)}</div>
  {msg&&<p role="status" className={'text-sm '+(msg.bad?'text-red-700':'')}>{msg.t}</p>}
  <button onClick={save} className="btn bg-supplier text-white w-full">Save prices and stock</button><button onClick={out} className="btn border border-supplier text-supplier w-full">Log out</button></Shell>}
