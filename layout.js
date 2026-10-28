import './globals.css'
import SITE from '../lib/site'
export const metadata={metadataBase:new URL(SITE.url),title:{default:'BuildSmart | Compare building material prices',template:'%s | BuildSmart'},
 description:SITE.description,alternates:{canonical:'/'},robots:{index:true,follow:true},
 openGraph:{type:'website',siteName:'BuildSmart',locale:'en_KE',title:'BuildSmart | Compare building material prices',description:SITE.description},
 twitter:{card:'summary_large_image'}}
export const viewport={width:'device-width',initialScale:1,themeColor:'#1D4ED8'}
// LocalBusiness is only emitted once a real address is filled in lib/site.js. Marking up a business address you do not have would be false data.
const org={'@context':'https://schema.org','@type':SITE.address?'LocalBusiness':'Organization',name:SITE.legalName||SITE.name,url:SITE.url,description:SITE.description,areaServed:['Juja','Thika','Ruiru','Nairobi'].map(n=>({'@type':'City',name:n})),...(SITE.email&&{email:SITE.email}),...(SITE.phone&&{telephone:SITE.phone}),...(SITE.address&&{address:{'@type':'PostalAddress',streetAddress:SITE.address,addressCountry:'KE'}})}
export default function L({children}){return<html lang="en-KE"><body>{children}
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(org).replace(/</g,'\\u003c')}}/></body></html>}
