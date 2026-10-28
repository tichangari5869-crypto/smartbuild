'use client'
export default function Err({reset}){return<main className="max-w-xl mx-auto p-6 min-h-screen flex flex-col justify-center gap-3">
 <h1 className="text-2xl font-bold">Something went wrong</h1><p className="text-slate-600">Please try again. If it keeps happening, contact us.</p>
 <button onClick={reset} className="btn bg-buyer text-white self-start">Try again</button></main>}
