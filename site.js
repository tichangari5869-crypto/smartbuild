// Single source of truth for business details. Fill these in before launch; `npm run launch-check` fails while any are empty.
module.exports={
 name:'BuildSmart',
 url:process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000',
 description:'Compare building material prices from hardware stores near you, with transport and delivery included in the total.',
 legalName:'',        // registered business name
 registration:'',     // business registration number
 address:'',          // physical or postal address
 email:'',            // contact and privacy requests
 phone:'',
 odpcRegistration:'', // ODPC data controller registration number
 updated:'27 October 2026'}
