import SITE from '../lib/site'
export default function sitemap(){return['','/privacy','/terms','/cookies','/refund'].map(p=>({url:SITE.url+p,lastModified:new Date('2026-10-27')}))}
