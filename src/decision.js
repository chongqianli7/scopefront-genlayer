import {frontier} from './model.js';
// Preferences never alter the protocol frontier or imply a new consensus result.
export function decision(record, {budget=null,required=[]}={}) {
 if(budget!==null&&(!Number.isSafeInteger(budget)||budget<1))throw Error('Budget must be a positive amount in minor units.');
 if(!Array.isArray(required)||required.some(i=>!Number.isInteger(i)||i<0||i>=record.criteria.length))throw Error('Invalid required scope item.');
 required=[...new Set(required)].sort((a,b)=>a-b);
 const offers=record.vendors.map(v=>record.offers[v]).filter(Boolean);
 const assessed=offers.length===record.vendors.length&&record.rows.length===offers.length&&record.rows.every((r,i)=>r.vendor===offers[i].vendor&&r.cells.length===record.criteria.length&&r.cells.every((c,j)=>c.criterion===j&&['INCLUDED','EXCLUDED','UNCLEAR'].includes(c.label)));
 const computed=assessed?frontier(offers,record.rows):{candidates:[],comparisons:[],needs_clarification:[]};
 const rows=offers.map(o=>{
  const row=record.rows.find(r=>r.vendor===o.vendor);
  const missing=required.filter(i=>row?.cells[i]?.label!=='INCLUDED');
  const reasons=[];
  if(!assessed)reasons.push('Awaiting a complete consensus matrix');
  else if(computed.needs_clarification.includes(o.vendor))reasons.push('Unclear coverage blocks selection');
  else if(!computed.candidates.includes(o.vendor))reasons.push('Dominated on the protocol frontier');
  if(budget!==null&&o.cents>budget)reasons.push('Over budget');
  if(missing.length)reasons.push('Required scope not explicitly included: '+missing.map(i=>i+1).join(', '));
  return {vendor:o.vendor,cents:o.cents,eligible:reasons.length===0,reasons,missing,budgetHeadroom:budget===null?null:budget-o.cents};
 });
 const eligible=rows.filter(r=>r.eligible).sort((a,b)=>a.cents-b.cents||a.vendor.localeCompare(b.vendor));
 return {budget,required,assessed,rows,eligible:eligible.map(r=>r.vendor),cheapest:eligible.length?eligible.filter(r=>r.cents===eligible[0].cents).map(r=>r.vendor):[]};
}
export function report(record,preferences,context={}) {
 return {schema:'scopefront-decision-1',createdAt:new Date().toISOString(),provenance:context.mode==='live'?'FINALIZED_CHAIN_READBACK':'ILLUSTRATIVE',network:61999,contract:context.mode==='live'?context.contract:null,record,decision:decision(record,preferences),limits:'Local buyer preferences applied to the existing consensus matrix. No new validator assessment, automatic award, payment, or proof of vendor delivery.'};
}
export function csv(result){
 const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 return [['Vendor','Price (minor units)','Meets preferences','Budget headroom (minor units)','Reasons'],...result.rows.map(r=>[r.vendor,r.cents,r.eligible?'Yes':'No',r.budgetHeadroom,r.reasons.join('; ')])].map(r=>r.map(cell).join(',')).join('\r\n');
}
