#!/usr/bin/env node
// r67 analyzer: reads journey-establishment-r67-seed{345..348}.json plus
// hidecraft / arrivals / learn / repeatsit probe files from EVID dir,
// prints the pre-registered verdict table. A missing probe file on an
// over=true seed is SKIP-over (probes return before writing), NOT a crash.
// Usage: node scripts/analyze-journey-establishment-r67-20261031.js [EVIDDIR]
'use strict';
const fs = require('fs');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-31';
const SEEDS = [345, 346, 347, 348];
const load = (n) => { try { return JSON.parse(fs.readFileSync(`${EVID}/${n}`, 'utf8')); } catch (e) { return null; } };
for (const seed of SEEDS) {
  const j = load(`journey-establishment-r67-seed${seed}.json`);
  if (!j) { console.log(`\n=== seed ${seed}: PANEL JSON MISSING ===`); continue; }
  const g = j.guardrails || {};
  const vDeaths = (j.deaths || []).filter(d => d.kind !== 'monster');
  const mKills = (j.deaths || []).filter(d => d.kind === 'monster');
  const starv = (j.deaths || []).filter(d => d.day >= 15 && /starvat|hunger|thirst/.test(String(d.cause || '')));
  const craft = j.armorCraftLog || [];
  const lessons = (j.skillLessonLog || []).filter(r => r.via === 'villager');
  const lessonDays = new Set(lessons.map(r => r.day)).size;
  const distinct = new Set(lessons.map(r => r.skill)).size;
  const ints = (j.intakeDays || []).slice(-7);
  const starvCounts = ints.map(d => (d.starving || []).length);
  const meanStarv = starvCounts.length ? (starvCounts.reduce((a, b) => a + b, 0) / starvCounts.length) : null;
  const cds = j.contestDeathSnap || {};
  const contestTele = (j.deaths || []).filter(d => String(d.cause || '') === 'contest');
  const cdKeys = cds.contestDeathsById ? Object.keys(cds.contestDeathsById) : [];
  const cdVerdict = contestTele.length === 0 ? 'NO-CONTEST-DEATH(UNTESTED)'
    : (cdKeys.length && (cds.rosterStartLen - cds.rosterEndLen) === vDeaths.length ? 'LEDGERED' : 'UNMATCHED');
  console.log(`\n=== seed ${seed} (reachedDay ${j.reachedDay}, over ${j.over} ${JSON.stringify(j.overCause || {})}) ===`);
  console.log(`  guardrails: alive=${g.popAlive} pantry=${g.pantryKcal} tier=${g.tier} villagerDeaths=${vDeaths.length} ${JSON.stringify(vDeaths.map(d => d.who + ':' + d.cause))} monsterKills=${mKills.length} contests=${JSON.stringify((g.contestList || []).map(c => c.cid + ':' + c.outcome))}`);
  console.log(`  gear: startHide=${(j.gearCensusStart || {}).wornHide} endHide=${(j.gearCensusEnd || {}).wornHide} endBark=${(j.gearCensusEnd || {}).wornBark} craftRows=${JSON.stringify(craft.map(r => r.item + ':' + (r.ok ? 'ok' : 'fail') + '@d' + r.day + ':' + r.name))}`);
  console.log(`  LESSON-DIST: ${lessonDays >= 21 || distinct >= 5 ? 'GO' : 'NO-GO'} (villager-via days=${lessonDays} distinct=${distinct})`);
  console.log(`  FOOD-INTAKE: final7 starving=${JSON.stringify(starvCounts)} mean=${meanStarv === null ? '-' : meanStarv.toFixed(2)} starvationDeaths=${starv.length} verdict=${(meanStarv !== null && meanStarv <= 1 && starv.length === 0) ? 'DIST-OK' : 'DIST-FLAG'}`);
  console.log(`  CONTEST-DEATH: ${cdVerdict} raw=${JSON.stringify(cds.contestDeathsById || null)} roster ${cds.rosterStartLen}->${cds.rosterEndLen} namedDeaths=${vDeaths.length}`);
  console.log(`  mship: ${JSON.stringify(j.mshipSnap || null)}`);
  for (const [kind, file] of [['HIDECRAFT', `journey-establishment-r67-hidecraft-seed${seed}.json`], ['BARKCRAFT', `journey-establishment-r67-barkcraft-seed${seed}.json`], ['CONTESTDEATH', `journey-establishment-r67-contestdeath-seed${seed}.json`], ['ARRIVALS', `journey-establishment-r67-arrivals-seed${seed}.json`], ['LEARN', `journey-establishment-r67-learn-seed${seed}.json`], ['REPEATSIT', `journey-establishment-r67-repeatsit-seed${seed}.json`]]) {
    const p = load(file);
    if (!p) { console.log(`  ${kind}: MISSING (r67 probes always write — this is a crash, not a skip)`); continue; }
    if (kind === 'HIDECRAFT') console.log(`  HIDECRAFT: verdict=${p.verdict} attempts=${JSON.stringify(p.attempts.map(a => 'd' + a.day + ' L' + ((a.recipe && a.recipe.level) || 0) + ' pack=' + JSON.stringify(a.packMats) + ' stashHide=' + ((a.stashMats || {}).hide || 0) + ' ->' + a.result))}`);
    if (kind === 'ARRIVALS') console.log(`  ARRIVALS: verdict=${p.verdict} accepted=${p.accepted ? (p.accepted.name + ' score=' + p.accepted.score) : '-'} days=${JSON.stringify((p.days || []).map(d => 'd' + d.day + (d.joined ? ':JOINED' : '')))}`);
    if (kind === 'LEARN') console.log(`  LEARN: verdict=${p.verdict} gained=${JSON.stringify(p.gained || [])} hideRecipe=${JSON.stringify((p.hideSnap || {}).playerHideRecipe || null)} wearers=${JSON.stringify((p.hideSnap || {}).hideWearers || [] )} stashHide=${(p.hideSnap || {}).stashHide}`);
    if (kind === 'REPEATSIT') console.log(`  REPEATSIT: verdict=${p.verdict} subject=${(p.subject || {}).name || '-'}`);
    if (kind === 'BARKCRAFT') console.log(`  BARKCRAFT: verdict=${p.verdict} attempts=${JSON.stringify(p.attempts.map(a => 'd' + a.day + ' L' + ((a.recipe && a.recipe.level) || 0) + ' pack=' + JSON.stringify(a.packMats) + ' ->' + a.result))}`);
    if (kind === 'CONTESTDEATH') console.log(`  CONTESTDEATH: verdict=${p.verdict} subject=${(p.subject || {}).name || '-'} checks1=${JSON.stringify(p.after1Checks || null)} checks2=${JSON.stringify(p.after2Checks || null)}`);
    if (kind === 'LEARN') {
      const grants = (j.grantLog || []).filter(g => g.phase === 'learn' && g.domain === 'skill');
      const untraced = (p.gained || []).filter(s => !grants.some(g => g.id === s));
      const took = (p.days || []).filter(d => d.took).map(d => d.took.skill);
      const extras = (p.gained || []).filter(g => !took.includes(g));
      const untracedX = extras.filter(g => !grants.some(gr => gr.id === g));
      console.log(`  LEARN-JUMP (r67 revised: extras-only): gained=${JSON.stringify(p.gained || [])} took=${JSON.stringify(took)} extras=${JSON.stringify(extras)} probeSkillGrants=${JSON.stringify(grants.map(g => 'd' + g.day + ':' + g.id + '/' + g.type + (g.by ? '/by:' + g.by : '')))} untracedExtras=${JSON.stringify(untracedX)} -> ${extras.length === 0 ? 'NO-JUMP' : (untracedX.length ? 'UNTRACED' : 'TRACED')}`);
      // LEARN-BUNDLE (r67 primary): place each extra at its first turn snapshot.
      const bundlePlace = [];
      for (const x of extras) {
        let found = null;
        const days = p.days || [];
        for (let di = 0; di < days.length && !found; di++) {
          const turns = days[di].turns || [];
          for (let ti = 0; ti < turns.length; ti++) {
            if ((turns[ti].skills || []).includes(x)) { found = { dayIdx: di, day: days[di].day, turnIdx: ti, turn: turns[ti] }; break; }
          }
        }
        if (!found) { bundlePlace.push({ extra: x, place: 'BETWEEN-DAYS', note: 'in L.after but in no turn snapshot (advance/sleep gap)' }); continue; }
        const dayRec = days[found.dayIdx];
        const tookSkill = dayRec.took ? dayRec.took.skill : null;
        const tookTurnIdx = (dayRec.turns || []).findIndex(t => t.phase === 'took');
        let place;
        if (found.turn.phase === 'took' && found.turnIdx === tookTurnIdx) place = 'BUNDLE-AT-TOOK';
        else if (found.turnIdx < tookTurnIdx || tookTurnIdx < 0) place = 'EARLIER-CONVO';
        else place = 'TOOK-CLOSE-OR-LATER';
        const teacherKnows = dayRec.took ? (((dayRec.took.teacherSkillsBefore || []).includes(x)) ? 'teacher-knew' : 'teacher-NOT-known') : 'no-took-day';
        bundlePlace.push({ extra: x, place, day: found.day, turn: found.turn.phase + ':' + (found.turn.name || found.turn.vid), tookSkill, teacherKnows });
      }
      console.log(`  LEARN-BUNDLE: ${JSON.stringify(bundlePlace)}`);
      const viaRows = [];
      for (const x of extras) {
        const row = (p.learnSkillRows || []).find(r => r.skill === x);
        viaRows.push({ extra: x, via: row ? row.via : null, day: row ? row.day : null, part: row ? row.part : null, knewBefore: row ? row.knewBefore : null, ok: row ? row.ok : null });
      }
      console.log(`  LEARN-VIA (learnSkill wrap, one-path): ${JSON.stringify(viaRows)}`);
      const startRows = (j.gearCensusStart || {}).villagers || [];
      const missed = startRows.reduce((t, r) => t + Math.max(0, (r.spares || []).length - (r.sparesOld || []).length), 0);
      const startCarried = {};
      for (const r of startRows) startCarried[r.id] = new Set([...(r.spares || []), ...(r.stashedArmor || [])]);
      const startWorn = {};
      for (const r of startRows) startWorn[r.id] = new Set((r.equipped || []).filter(x => x === 'bark_armor' || x === 'hide_armor'));
      const tele = j.gearTeleLog || [];
      const craft = j.armorCraftLog || [];
      const gup = j.gearUpLog || [];
      const gifts = (j.giftLog || []).filter(g => !g.seedArmorWearer);
      const classified = [];
      for (const ch of (j.gearChanges || [])) {
        const beforeWorn = new Set((ch.before && ch.before.worn) || []);
        const afterWorn = new Set((ch.after && ch.after.worn) || []);
        for (const piece of afterWorn) {
          if (beforeWorn.has(piece)) continue;
          let cls = 'UNEXPLAINED', ev = null;
          if (ch.firstSeen) { cls = 'ARRIVAL-CARRIED'; ev = 'firstSeen d' + ch.day; }
          else if ((startCarried[ch.vid] || new Set()).has(piece)) { cls = 'SEEDED'; ev = 'carried at census start'; }
          else {
            const trow = tele.find(t => String(t.vid) === String(ch.vid) && t.item === piece && t.day <= ch.day);
            if (trow) { cls = trow.via === 'armory' ? 'ARMORY' : 'SPARES-GIFT'; ev = 'tele d' + trow.day + ' via=' + trow.via + (trow.from ? ' from=' + trow.from : ''); }
            else {
              const crow = craft.find(c => String(c.vid) === String(ch.vid) && c.item === piece && c.ok && c.day <= ch.day);
              if (crow) { cls = 'CRAFT'; ev = 'craft ok d' + crow.day; }
              else {
                const grow = gup.find(g => String(g.vid) === String(ch.vid) && (g.after && g.after.worn || []).includes(piece) && g.day <= ch.day);
                if (grow) { cls = 'GEARUP'; ev = 'gearUp d' + grow.day + ' acquire=' + grow.acquire; }
                else {
                  const firow = gifts.find(g => String(g.vid) === String(ch.vid) && (g.after && g.after.worn || []).includes(piece) && g.day <= ch.day);
                  if (firow) { cls = 'GIFT-PLAYER'; ev = 'gift d' + firow.day; }
                }
              }
            }
          }
          classified.push({ vid: ch.vid, name: ch.name, piece, firstDay: ch.day, cls, ev });
        }
      }
      const seedWorn = Object.keys(startWorn).filter(id => startWorn[id].size).map(id => { const r = startRows.find(x => x.id === id); return (r ? r.name : id) + ':' + [...startWorn[id]].join(','); });
      console.log(`  SPARES-BUG: census-start pieces missed by old filter: ${missed} (armorSeedVid=${(j.gearCensusStart || {}).armorSeedVid || '-'})`);
      console.log(`  EQUIP-ROUTE: startWorn=[${seedWorn.join(' ')}] newWearers=${JSON.stringify(classified)} gearTele=${JSON.stringify(tele.map(t => 'd' + t.day + ':' + t.name + '<-' + (t.from || t.via) + ':' + t.item))} craftRows=${JSON.stringify(craft.map(r => r.item + ':' + (r.ok ? 'ok' : 'fail') + '@d' + r.day + ':' + r.name))} gearUpChanges=${(j.gearUpLog || []).length} autoEquipChanges=${(j.autoEquipLog || []).length}`);
    }
  }
}
console.log('\nPanel verdicts (pre-registered bars):');
{ let missed = 0, unexpl = [];
  for (const seed of SEEDS) { const j = load(`journey-establishment-r67-seed${seed}.json`); if (!j) continue;
    missed += ((j.gearCensusStart || {}).villagers || []).reduce((t, r) => t + Math.max(0, (r.spares || []).length - (r.sparesOld || []).length), 0);
    for (const ch of (j.gearChanges || [])) { const bw = new Set((ch.before && ch.before.worn) || []); for (const p of ((ch.after && ch.after.worn) || [])) if (!bw.has(p)) { const sc = (j.gearCensusStart || {}).villagers || []; const sr = sc.find(x => x.id === ch.vid); const seeded = sr && [...(sr.spares || []), ...(sr.stashedArmor || [])].includes(p); const trow = (j.gearTeleLog || []).find(t => String(t.vid) === String(ch.vid) && t.item === p && t.day <= ch.day); const crow = (j.armorCraftLog || []).find(c => String(c.vid) === String(ch.vid) && c.item === p && c.ok && c.day <= ch.day); if (!ch.firstSeen && !seeded && !trow && !crow) unexpl.push(`${seed}:${ch.name}:${p}@d${ch.day}`); } }
  }
  console.log(`  SPARES-BUG panel: missed pieces=${missed} -> ${missed >= 1 ? 'CONFIRMED' : 'NOT-REPRODUCED'}`);
  console.log(`  EQUIP-ROUTE panel: unexplained=${unexpl.length ? JSON.stringify(unexpl) : 'none'} -> ${unexpl.length ? 'OPEN' : 'RESOLVED'}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-hidecraft-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  HIDE-CRAFT-PLAYER: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-arrivals-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  ARRIVALS-ACCEPT: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-learn-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict + '(' + (p.gained || []).length + ')' : 'MISSING'}`); }
  console.log(`  LEARN: ${v.join(' ')}`); }
{ // LEARN-BUNDLE panel verdict (pre-registered r67 bars)
  const counts = { 'BUNDLE-AT-TOOK': 0, 'EARLIER-CONVO': 0, 'BETWEEN-DAYS': 0, 'TOOK-CLOSE-OR-LATER': 0 };
  let seedsWithExtras = 0, seedsWithPlaced = 0;
  for (const seed of SEEDS) {
    const p = load(`journey-establishment-r67-learn-seed${seed}.json`); if (!p) continue;
    const took = (p.days || []).filter(d => d.took).map(d => d.took.skill);
    const extras = (p.gained || []).filter(g => !took.includes(g));
    if (!extras.length) continue;
    seedsWithExtras++;
    let placed = false;
    for (const x of extras) {
      let found = null;
      const days = p.days || [];
      for (let di = 0; di < days.length && !found; di++) for (let ti = 0; ti < (days[di].turns || []).length; ti++) if (((days[di].turns[ti].skills || []).includes(x))) { found = { day: days[di], turnIdx: ti, turn: days[di].turns[ti] }; break; }
      if (!found) { counts['BETWEEN-DAYS']++; placed = true; continue; }
      const tookTurnIdx = (found.day.turns || []).findIndex(t => t.phase === 'took');
      if (found.turn.phase === 'took' && found.turnIdx === tookTurnIdx) counts['BUNDLE-AT-TOOK']++;
      else if (found.turnIdx < tookTurnIdx || tookTurnIdx < 0) counts['EARLIER-CONVO']++;
      else counts['TOOK-CLOSE-OR-LATER']++;
      placed = true;
    }
    if (placed) seedsWithPlaced++;
  }
  const total = counts['BUNDLE-AT-TOOK'] + counts['EARLIER-CONVO'] + counts['BETWEEN-DAYS'] + counts['TOOK-CLOSE-OR-LATER'];
  let verdict = 'NO-EXTRA';
  if (seedsWithExtras) {
    const dom = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b);
    verdict = dom + ` (${counts[dom]}/${total} extras; seedsWithExtras=${seedsWithExtras})`;
  }
  console.log(`  LEARN-BUNDLE panel: ${JSON.stringify(counts)} -> ${verdict}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-repeatsit-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  REPEATSIT: ${v.join(' ')}`); }
{ let barkOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r67-seed${seed}.json`); if (j) barkOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'bark_armor').length; }
  console.log(`  BARK-CRAFT panel ok rows: ${barkOk} -> ${barkOk >= 1 ? 'GO' : 'NO-GO'}`); }
{ let hideOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r67-seed${seed}.json`); if (j) hideOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'hide_armor').length; }
  console.log(`  HIDE-CRAFT (NPC tele rows) panel ok rows: ${hideOk}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-barkcraft-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  BARK-CRAFT-ATTEMPT: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r67-contestdeath-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  CONTEST-DEATH-STAGED: ${v.join(' ')}`); }
{ let missing = 0, total = 0;
  for (const seed of SEEDS) for (const k of ['repeatsit', 'learn', 'hidecraft', 'barkcraft', 'arrivals', 'contestdeath']) { total++; if (!load(`journey-establishment-r67-${k}-seed${seed}.json`)) missing++; }
  console.log(`  SKIP-FILES: missing ${missing}/${total} -> ${missing === 0 ? 'GO' : 'NO-GO'}`); }
