// PROOF TEST: the pellet passes to hungrier hands (2026-11-07).
//
// Steve's ruling (2026-11-07 17:55 CST): the pellet PASSES to hungrier
// hands. The trap: a pellet-fed bearer never hungers (calories.js
// dailyNeed returns 0), so no feast can carry the surge (feastBuff.js
// grantFeastBuff refuses while the reactor is online), so feastSurgeUsed
// never marks, so the table never prices the run (seed 99767: 3 wave-5
// kills, standing 422, 181 days, no seat ever priced).
//
// Trigger (evidence/2026-11-07/sim-pelletpass-prereg.md, amendment A1):
// at dawn, if a bearer is actually pellet-fed while >=3 living present
// villagers sit above hunger 70 (the game's own "hungry" line), the pellet
// passes to the hungriest of them. 30-day cooldown between passes.
// The holder is never left null (one reactor per world).
//
// Proves: the pass fires under the trigger (direct call AND the real dawn
// hook); it does NOT fire when the village is fed; the new bearer is a
// hungrier villager and the old bearer loses the pellet; the pass is voiced
// in plain words naming the new bearer; no pass on a stale holder (bearer
// dead); no second pass inside the 30-day cooldown; and the unblock chain
// (feast grants after the pass, a real combat strike spends the surge, the
// table prices the seat).
//
// Usage: node scripts/test-pellet-pass-20261107.js
'use strict';
const K = require('./godpath/lib');
const { buildShape: shape99767, driveSpend } = require('./lib/pellet-pass-shape-20261107');

function firstName(G, vid) {
  try { return String(G.displayName(vid)).split(' ')[0]; } catch (e) { return 'Someone'; }
}

(async () => {
  const T = K.reporter('pellet-pass');

  // ---- 1. The trap, as today: seat none, grant refused while online ----
  {
    const G = await K.load({ seed: 99767 });
    K.newRun(G);
    const { scholar: s } = shape99767(G);
    T.ok('setup: bearer is pellet-fed', G.fusionReactorOnline() === true);
    const seat0 = G.tableSeat();
    T.ok('setup: seat is none before the pass (food deed missing)',
      seat0 && seat0.seat === 'none' && seat0.detail.foodDeeds === false,
      JSON.stringify(seat0 && seat0.detail));
    const gr = G.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
    T.ok('setup: feast grant refused while the reactor is online', gr && gr.granted === false);
    T.ok('setup: feastSurgeUsed still false', s.prog.feastSurgeUsed !== true);
  }

  // ---- 2. The pass fires under the trigger; old bearer stripped ----
  let passNames = null;
  {
    const G = await K.load({ seed: 7 });
    K.newRun(G);
    const lines = K.captureSays(G);
    const { roster, scholar: s } = shape99767(G);
    const oldBearer = G.villagerId;
    const hungriest = roster[0]; // hunger 95, the highest stamped
    const fired = G.maybePassPellet();
    T.ok('pass fires when >=3 villagers sit above hunger 70', fired === true);
    const h = G.state.fusionReactorHolder;
    T.ok('holder moved to a villager', !!(h && h.who === 'villager' && h.vid === hungriest), JSON.stringify(h));
    T.ok('new bearer is the hungriest villager', h && h.vid === hungriest);
    T.ok('old bearer lost the reactor field', !s.fusionReactor);
    T.ok('old bearer lost the ability', !(s.abilities || []).some(a => ((a && a.id) || a) === 'fusion_reactor'));
    T.ok('scholar no longer pellet-fed', G.fusionReactorOnline() === false);
    T.ok('new bearer holds the ability', G.npcHasAbility(hungriest, 'fusion_reactor'));
    T.ok('new bearer hunger is 0 (the pellet feeds them now)', (G.npcNeeds(hungriest).hunger || 0) === 0);
    T.ok('holder never left null (singularity holds)', !!G.state.fusionReactorHolder);
    const beat = lines.filter(t => /little star inside/.test(t));
    T.ok('pass is voiced', beat.length === 1, beat.length + ' beat lines');
    if (beat.length) {
      const b = beat[0];
      const newName = firstName(G, hungriest);
      const oldName = firstName(G, oldBearer);
      T.ok('beat names the new bearer in plain words', b.indexOf(newName) !== -1, b.slice(0, 160));
      T.ok('beat names the old bearer', b.indexOf(oldName) !== -1);
      T.ok('beat says plainly why (never hungry while the village was)', /never got hungry while the village did/.test(b));
      T.ok('beat says the old bearer is hungry again', /hungry again/.test(b));
      T.ok('beat never hides behind unexplained "mantle"', !/mantle/.test(b), b.slice(0, 120));
      passNames = { oldName, newName };
    }
    // No second pass inside the 30-day cooldown, even still hungry:
    // re-stamp hunger on other villagers by hand (never re-run the shape
    // builder — it would reinstall the pellet on the scholar).
    const v = G.state.village;
    (v.roster || []).filter(id => id !== G.villagerId && id !== hungriest).slice(0, 4).forEach((vid, i) => { G.npcNeeds(vid).hunger = 90 - i; });
    T.ok('no second pass inside the 30-day cooldown', G.maybePassPellet() === false);
    T.ok('holder unchanged through the cooldown', G.state.fusionReactorHolder.vid === hungriest);
  }

  // ---- 3. No pass when the village is fed ----
  {
    const G = await K.load({ seed: 42 });
    K.newRun(G);
    shape99767(G, { fed: true });
    const before = JSON.stringify(G.state.fusionReactorHolder);
    T.ok('no pass when the village is fed', G.maybePassPellet() === false);
    T.ok('holder unchanged when fed', JSON.stringify(G.state.fusionReactorHolder) === before);
  }

  // ---- 4. No pass on a stale holder (bearer died; the flag stayed) ----
  {
    const G = await K.load({ seed: 99 });
    K.newRun(G);
    const { roster } = shape99767(G);
    void roster;
    const firstBearer = G.villagerId;
    G.playerDeath('a proof test');
    T.ok('a successor took the mantle', !G.over && G.villagerId && G.villagerId !== firstBearer, 'villagerId=' + G.villagerId);
    T.ok('successor holds no reactor', !G.fusionReactorOnline());
    T.ok('the flag survived the mantle (singularity)', !!G.state.fusionReactorHolder);
    T.ok('no pass on a stale holder (nobody is fed)', G.maybePassPellet() === false);
  }

  // ---- 5. A villager bearer passes it on too ----
  {
    const G = await K.load({ seed: 1234 });
    K.newRun(G);
    shape99767(G);
    // Move the pellet to a villager first: strip the scholar, grant one.
    const s = G.state.scholar;
    s.abilities = (s.abilities || []).filter(a => ((a && a.id) || a) !== 'fusion_reactor');
    delete s.fusionReactor;
    G.state.fusionReactorHolder = null;
    const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
    const vBearer = roster[5]; // hunger 30 — the fed one, to prove the pass skips them
    T.ok('setup: villager granted the reactor', G.npcGrantAbility(vBearer, 'fusion_reactor') === true);
    T.ok('setup: holder is the villager', G.state.fusionReactorHolder.vid === vBearer);
    const fired = G.maybePassPellet();
    T.ok('villager bearer passes it on when the village hungers', fired === true);
    const h = G.state.fusionReactorHolder;
    T.ok('it went to the hungriest other villager (not the fed ex-bearer)', h && h.vid === roster[0] && h.vid !== vBearer, JSON.stringify(h));
    T.ok('ex-bearer lost the ability', !G.npcHasAbility(vBearer, 'fusion_reactor'));
  }

  // ---- 6. The dawn hook fires it (real endDay, not just a direct call) ----
  {
    const G = await K.load({ seed: 555 });
    K.newRun(G);
    shape99767(G);
    const day0 = G.state.scholar.day;
    G.endDay();
    T.ok('endDay advances the day', G.state.scholar.day === day0 + 1, 'day=' + G.state.scholar.day);
    const h = G.state.fusionReactorHolder;
    T.ok('the dawn tick passes the pellet on day one', !!(h && h.who === 'villager'), JSON.stringify(h));
    T.ok('pass recorded on day one', (G.state.pelletPass || {}).lastPassDay === day0);
  }

  // ---- 7. The unblock chain: feast grants, a real strike spends it, seat prices ----
  {
    const G = await K.load({ seed: 777 });
    K.newRun(G);
    const lines = K.captureSays(G);
    const { scholar: s } = shape99767(G);
    void lines;
    G.endDay(); // the pass fires at dawn
    T.ok('chain setup: pellet passed', !!(G.state.fusionReactorHolder && G.state.fusionReactorHolder.who === 'villager'));
    T.ok('chain setup: scholar no longer online', G.fusionReactorOnline() === false);
    // nationalLive is DERIVED state (the hierarchy tick recomputes it from
    // real links, and this constructed state has none — endDay cleared it).
    // Re-assert it after the dawn ticks: the shape under test is "a village
    // that HOLDS national rank", not "a village that just earned it".
    G.state.nationalLive = true;
    T.ok('chain setup: national rank holds', G.scaleRank() === 'national');
    const feast = G.hostFeast();
    T.ok('a feast can now be hosted', feast && feast.ok !== false, JSON.stringify(feast && feast.why));
    T.ok('the feast granted the buff', !!G.feastedActive(), 'feastBuff=' + JSON.stringify((G.state.scholar || {}).feastBuff));
    // One real fight, real strikes — the surge must spend on a landed blow.
    const spent = driveSpend(G);
    T.ok('a real combat strike spends the surge', spent === true, 'feastSurgeUsed=' + !!((G.state.scholar || {}).prog || {}).feastSurgeUsed);
    const seat = G.tableSeat();
    T.ok('the table prices the seat after the chain', seat && seat.seat !== 'none', JSON.stringify(seat && seat.seat));
    T.ok('the seat is the full seat (every other deed was done)', seat && seat.seat === 'full', JSON.stringify(seat && seat.seat));
    void s;
  }

  T.done();
})().catch(e => { console.error(e); process.exit(1); });
