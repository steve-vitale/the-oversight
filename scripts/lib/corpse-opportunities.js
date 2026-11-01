'use strict';
// Diagnostic only: read raw fields after native calls. Never feeds a policy.
// Local/adjacent observations are coverage, not path/carry/knowledge eligibility.
function install(G) {
  const bodies = new Map(), originals = new Map();
  let observations = 0;
  const copy = x => x === undefined ? null : JSON.parse(JSON.stringify(x));
  const position = () => {
    const s = G.state.scholar, f = G.tbfight, p = f?.fighters?.find(x=>x.key==='p');
    return {day:s.day,tick:s.dayTicks,bearer:G.villagerId,node:[G.map.px,G.map.py],
      at:[s.mx ?? 4,s.my ?? 4],inside:!!s.insideHaven,over:!!G.over,health:s.health,
      combat:f&&!f.over?{id:f.id,gridSize:f.gridSize || 9,playerAt:p?[p.mx,p.my]:null}:null,
      pendingEncounter:!!G.pendingEncounter,contest:!!G.state.activeContest};
  };
  function sample(boundary) {
    // loadGame exposes the runtime before setupGame creates a run.
    if (!G.state?.scholar || !G.map) return;
    observations++;
    const p = position();
    for (const c of G.state.corpses || []) {
      let r = bodies.get(c.id);
      if (!r) {
        r = {id:c.id,kind:c.kind,person:c.villagerId || null,dayDied:c.dayDied,
          firstObserved:{boundary,position:p,node:copy(c.node),scene:c.scene || null,items:copy(c.items || [])},
          locationKnowledge:null,deathKnownObserved:false,localObservations:0,adjacentObservations:0,
          rangeCalls:0,rangeAccepted:0,rangeRefused:0,transfers:[],firstLocal:null,firstAdjacent:null,
          quietAdjacentObservations:0,firstQuietAdjacent:null};
        bodies.set(c.id,r);
      }
      r.deathKnownObserved ||= !!c.deathKnown;
      r.last = {position:p,node:copy(c.node),scene:c.scene || null,items:copy(c.items || []),
        deathKnown:!!c.deathKnown,buried:!!c.buried,looted:!!c.looted,battleGrid:c.battleGrid || null};
      // Raw room observations only. Do not call corpseInScene/range/path/carry.
      const t = G.map.tiles?.[p.node[1]]?.[p.node[0]];
      const room = p.inside && t?.type === 'haven' ? 'hall' : 'outside';
      const local = c.node?.x === p.node[0] && c.node?.y === p.node[1] && (c.scene || 'outside') === room;
      if (!local || c.buried || c.looted) continue;
      r.localObservations++;
      r.firstLocal ||= {boundary,position:p};
      if (Number.isInteger(c.mx) && Number.isInteger(c.my) &&
          Math.max(Math.abs(c.mx-p.at[0]),Math.abs(c.my-p.at[1])) <= 1) {
        r.adjacentObservations++;
        r.firstAdjacent ||= {boundary,position:p};
        if (!p.combat && !p.pendingEncounter && !p.contest && !p.over && p.health>0 && !(c.battleGrid>9)) {
          r.quietAdjacentObservations++;
          r.firstQuietAdjacent ||= {boundary,position:p};
        }
      }
    }
  }
  function wrap(name, after, before) {
    if (typeof G[name] !== 'function') return;
    const original = G[name]; originals.set(name,original);
    G[name] = function (...args) {
      const prior = before ? before(args) : null;
      const result = original.apply(this,args);
      sample(name);
      if (after) after(args,result,prior);
      return result;
    };
  }
  for (const name of ['registerDeath','travelTo','microMove','pathStep','enterBuilding','exitBuilding','recoverBearer']) wrap(name);
  wrap('_corpseCheckRange',(args,result) => {
    const r = bodies.get(args[0]?.id);
    if (!r) return;
    r.rangeCalls++;
    if (result === true) r.rangeAccepted++;
    if (result === false) r.rangeRefused++;
  });
  wrap('_corpseTakeStack',(args,result,prior) => {
    const r = bodies.get(args[0]?.id);
    if (r) r.transfers.push({position:position(),itemBefore:prior,itemAfter:copy(args[1])});
  },args=>copy(args[1]));
  sample('installed');
  return {
    finish() {
      sample('finished');
      return {version:1,scope:'Selected passive native-boundary observations; not a routing policy, location-knowledge receipt or exhaustive opportunity denominator.',
        observations,bodies:[...bodies.values()]};
    },
    uninstall() { for (const [name,original] of originals) G[name] = original; },
  };
}
module.exports = {install};
