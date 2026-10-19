'use strict';
const assert = require('assert');
const T = require('./lib').reporter('Market path summary');
const {summarize} = require('../summarize-market-path');
const checks = {state:true,row:true,metrics:true,warnings:true,diagnostic:true};
const definitions = {kit:['hoarder','haggle','sweetener'],payoffs:['sweetener']};
function fixture() {
  return {rows:[{policy:'merchant',seed:1,checks:{...checks},control:{checks:{...checks},nextRandom:0.5},nextRandom:0.5,dropped:0,choiceDropped:0,errors:[],
    snapshots:[{person:'first',held:['hoarder'],marketDeed:{day:2},occupation:null},{person:'next',held:['haggle','sweetener'],marketDeed:null,occupation:'lawyer'}],
    picks:[{person:'next',day:4,offers:[{id:'sweetener'},{id:'hoarder'}],id:'sweetener',before:['haggle'],after:['haggle','sweetener']},
      {person:'next',day:5,offers:[{id:'hoarder'}],id:'hoarder',before:['haggle','sweetener'],after:['haggle','sweetener']}]}]};
}
function test(name, fn) { try { fn(); T.ok(name,true); } catch(e) { T.ok(name,false,e.message); } }
test('successors never combine a dead bearer deed and powers into a qualifying kit',()=>{
  const s=summarize(fixture(),definitions);
  assert.equal(s.totals.maxSimultaneous,2); assert.equal(s.rows[0].people.length,2);
  assert.equal(s.rows[0].people[0].deedObserved,true); assert.equal(s.rows[0].people[1].deedObserved,false);
});
test('actual held gain distinguishes a successful choice from a refused truthy return',()=>{
  const s=summarize(fixture(),definitions); assert.equal(s.totals.offerCalls,2); assert.equal(s.totals.acquiredAtChoice,1);
  assert.equal(s.rows[0].offers[1].gained,false);
});
test('payoff and occupation unknowns stay bearer-specific',()=>{
  const s=summarize(fixture(),definitions); assert.equal(s.totals.payoffBearerOccurrences,1); assert.equal(s.totals.unknownOccupationBearerOccurrences,1);
});
for (const fault of ['state','row','metrics','warnings','diagnostic']) test('rejects unverified '+fault,()=>{
  const f=fixture(); f.rows[0].control.checks[fault]=false; assert.throws(()=>summarize(f,definitions),/Unverified/);
});
for (const fault of ['dropped','choiceDropped','rng','errors']) test('rejects incomplete or impure '+fault,()=>{
  const f=fixture(),r=f.rows[0]; if(fault==='rng')r.control.nextRandom=0.6;else if(fault==='errors')r.errors=['failure'];else r[fault]=1;
  assert.throws(()=>summarize(f,definitions),/Incomplete or impure/);
});
T.done();
