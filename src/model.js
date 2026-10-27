export function frontier(offers,rows){
 const known=rows.map((r,i)=>r.cells.every(c=>c.label!=='UNCLEAR')?i:-1).filter(i=>i>=0);
 const cov=i=>new Set(rows[i].cells.flatMap((c,j)=>c.label==='INCLUDED'?[j]:[]));
 const comparisons=known.map(i=>({vendor:offers[i].vendor,dominated_by:known.filter(j=>i!==j&&offers[j].cents<=offers[i].cents&&[...cov(i)].every(x=>cov(j).has(x))&&(offers[j].cents<offers[i].cents||cov(j).size>cov(i).size)).map(j=>offers[j].vendor)}));
 return {candidates:comparisons.filter(r=>!r.dominated_by.length).map(r=>r.vendor),comparisons,needs_clarification:rows.filter((r,i)=>!known.includes(i)).map(r=>r.vendor)};
}
export function cents(value){if(!/^\d{1,8}(\.\d{1,2})?$/.test(value))throw Error('Use a positive price with at most two decimals.');const n=Math.round(Number(value)*100);if(n<1||n>1e9)throw Error('Price must be between 0.01 and 10,000,000.');return n;}
export const criteria=['Create a responsive four-page website.','Include original editable design source files.','Include thirty days of post-launch bug fixes.'];
export const terms=[
 'Fixed all-inclusive total: 800 USD. Includes a responsive four-page website. Original editable design source files are excluded. Thirty days of post-launch bug fixes are excluded.',
 'Fixed all-inclusive total: 1000 USD. Includes a responsive four-page website and original editable design source files. Thirty days of post-launch bug fixes are excluded.',
 'Fixed all-inclusive total: 1200 USD. Includes a responsive four-page website and original editable design source files. Thirty days of post-launch bug fixes are excluded.'
];
export function fixture(variant='tradeoff'){
 const vendors=[1,2,3].map(n=>'0x'+String(n).repeat(40));
 const offers=vendors.map((vendor,i)=>({vendor,cents:[80000,100000,120000][i],terms:terms[i]}));
 const labels=[['INCLUDED','EXCLUDED','EXCLUDED'],['INCLUDED','INCLUDED','EXCLUDED'],['INCLUDED','INCLUDED','EXCLUDED']];
 if(variant==='unclear'){labels[1][1]='UNCLEAR';offers[1].terms='Fixed all-inclusive total: 1000 USD. Includes a responsive four-page website. Source files may be available depending on the package. Thirty days of post-launch bug fixes are excluded.';}
 if(variant==='complete'){labels[2][2]='INCLUDED';offers[2].terms='Fixed all-inclusive total: 1200 USD. Includes a responsive four-page website, original editable design source files, and thirty days of post-launch bug fixes.';}
 const rows=vendors.map((vendor,i)=>({vendor,cells:criteria.map((c,j)=>({criterion:j,label:labels[i][j],quote:offers[i].terms,reason:'Authored illustration of scope coverage; not a validator assessment.'}))}));
 return {protocol:'scopefront-1',owner:'0x'+('9'.repeat(40)),id:'illustrative',title:'A small website, three different quotes',currency:'USD',criteria,vendors,offers:Object.fromEntries(offers.map(x=>[x.vendor,x])),rows,frontier:frontier(offers,rows),selected:'',status:'COMPARED',illustrative:true};
}
