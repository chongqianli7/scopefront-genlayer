import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../src/model.js';
import {decision,report,csv} from '../src/decision.js';
test('budget and required source files retain only qualifying frontier quote',()=>{const r=fixture();const original=JSON.stringify(r);const d=decision(r,{budget:100000,required:[1]});assert.deepEqual(d.eligible,[r.vendors[1]]);assert.equal(d.rows[1].budgetHeadroom,0);assert.match(d.rows[2].reasons.join(),/Dominated/);assert.equal(JSON.stringify(r),original);});
test('requirements and budget can leave no feasible quote',()=>{assert.equal(decision(fixture(),{budget:80000,required:[1]}).eligible.length,0);assert.equal(decision(fixture(),{required:[2]}).eligible.length,0);assert.equal(decision(fixture('complete'),{required:[2]}).eligible.length,1);});
test('unclear quotes and incomplete matrices never qualify',()=>{const r=fixture('unclear');assert.ok(!decision(r).eligible.includes(r.vendors[1]));r.rows.pop();assert.equal(decision(r).eligible.length,0);r.rows=[];assert.equal(decision(r).assessed,false);});
test('equal offers remain tied cheapest options',()=>{const r=fixture();r.offers[r.vendors[2]].cents=100000;const d=decision(r,{required:[1]});assert.deepEqual(d.cheapest,r.vendors.slice(1));});
test('invalid preferences fail and reports preserve provenance',()=>{assert.throws(()=>decision(fixture(),{budget:-1}));assert.throws(()=>decision(fixture(),{required:[8]}));assert.equal(report(fixture(),{},{}).provenance,'ILLUSTRATIVE');assert.equal(report(fixture(),{},{mode:'live',contract:'0xabc'}).contract,'0xabc');assert.match(csv(decision(fixture())),/Price \(minor units\)/);});
