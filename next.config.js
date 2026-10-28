const dev=process.env.NODE_ENV!=='production'
const supa=process.env.NEXT_PUBLIC_SUPABASE_URL||''
const csp=["default-src 'self'",
 `script-src 'self' 'unsafe-inline'${dev?" 'unsafe-eval'":''}`, // Next.js inline bootstrap scripts; move to nonces via middleware when adding a backend
 "style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'self'",
 `connect-src 'self'${supa?' '+supa+' '+supa.replace('https','wss'):''}${dev?' ws:':''}`,
 "frame-ancestors 'none'","base-uri 'self'","form-action 'self'","object-src 'none'",...(dev?[]:['upgrade-insecure-requests'])].join('; ')
module.exports={reactStrictMode:true,poweredByHeader:false,productionBrowserSourceMaps:false,compress:true,
 async headers(){return[{source:'/(.*)',headers:[
  {key:'Content-Security-Policy',value:csp},
  {key:'Strict-Transport-Security',value:'max-age=63072000; includeSubDomains'},
  {key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(self), payment=()'},
  {key:'Cross-Origin-Opener-Policy',value:'same-origin'}]}]}}
