import SITE from '../lib/site'
export default function Legal({title,path,children}){
 const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE.url+'/'},{'@type':'ListItem',position:2,name:title,item:SITE.url+path}]}
 return<main className="max-w-2xl mx-auto p-5 pb-16">
  <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-4"><a className="underline" href="/">Home</a> / <span aria-current="page">{title}</span></nav>
  <h1 className="text-3xl font-bold">{title}</h1><p className="text-sm text-slate-600 mt-1">Last updated {SITE.updated}</p>
  <div className="mt-4 space-y-3 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline [&_a]:text-buyer">{children}
   <h2>Who we are</h2><p>{SITE.legalName||SITE.name}{SITE.registration&&`, registration no. ${SITE.registration}`}{SITE.address&&`, ${SITE.address}`}.{SITE.email&&<> Email <a href={'mailto:'+SITE.email}>{SITE.email}</a>.</>}{SITE.phone&&` Phone ${SITE.phone}.`}{SITE.odpcRegistration&&` ODPC registration no. ${SITE.odpcRegistration}.`}</p></div>
  <nav aria-label="Legal pages" className="mt-8 text-sm flex flex-wrap gap-4"><a className="underline" href="/privacy">Privacy</a><a className="underline" href="/terms">Terms</a><a className="underline" href="/cookies">Cookies</a><a className="underline" href="/refund">Refunds</a></nav>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(crumbs).replace(/</g,'\\u003c')}}/></main>}
