// killconv-analyze-20261104.js — census + killer-trace analyzer for
// sim-killconv-a. Reads evidence/2026-11-04/perseed-killconv-a/*.json
// (or a dir given as argv[2]) and prints the kill-conversion census,
// damage accounting, beast-damage accounting, field decomposition,
// killer traces, and lever quantification. Pure analysis, no Game.
// Usage: node scripts/killconv-analyze-20261104.js [dir] [filename-substring-filter]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-killconv-a');
const filter = process.argv[3] || null;
const seedFilter = process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return s.trim(); }) : null;
const files = fs.readdirSync(dir).filter(function (f) {
  if (!f.endsWith('.json')) return false;
  if (filter && f.indexOf(filter) === -1) return false;
  if (seedFilter) {
    const m = f.match(/-s(\d+)-/);
    if (!m || seedFilter.indexOf(m[1]) === -1) return false;
  }
  return true;
}).sort();
const seeds = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
function classify(ex) {
  // Leader-death takes precedence over ANY fled flag: in the pilot,
  // 'fled' rows turned out to be leader-dead + companion-fled. A
  // companion fleeing while the leader dies is a fighter-died fight
  // with a companion-fled note, never a fled fight.
  if (!ex.end) return ex.superseded ? 'superseded' : 'UNENDED';
  if ((ex.kills && ex.kills.length) || (ex.end.monsterDeadW4 > 0)) return 'kill';
  const leadDead = ex.end.humansDead && ex.end.humansDead.indexOf(ex.leadVid) !== -1;
  const leadFled = ex.end.humansFled && ex.end.humansFled.indexOf(ex.leadVid) !== -1;
  if (leadDead) return 'fighter-died';
  if (leadFled) return 'fled';
  if (ex.end.humansDead && ex.end.humansDead.length) return 'fighter-died';
  return 'other:' + (ex.end.result || 'unknown');
}
function hitDealt(h) { return (h.hpDelta != null ? -h.hpDelta : 0); }

const tbRows = [];
const fieldRows = [];
const killDetails = [];
const killerTraces = [];
const orphans = [];
let instrumentErrors = 0, unended = 0, unclassified = 0;

for (const s of seeds) {
  instrumentErrors += (s.instrumentErrors || []).length;
  for (const o of (s.orphanTbEnds || [])) {
    // Routed + monster fled = the zero-turn episode family: proven by
    // the 99116 debug run (startCombat with before==after null, tbEnd
    // routed round 1 inside the call, zero player strikes/moves inside
    // any startCombat). A wounded monster (prior wound carried in)
    // does NOT disqualify it — the d77 audit carried exactly its d74
    // field-fight wound (783). Anything else stays unclassified.
    const routed = o.result === 'routed' && (o.monsters || []).every(function (m) { return !!m.fled; });
    orphans.push({ seed: s.seed, day: o.day, result: o.result, monsters: (o.monsters || []).map(function (m) { return m.mid + ' ' + m.hp + '/' + m.maxHp; }), class: routed ? 'scripted-rout' : 'UNCLASSIFIED-ORPHAN' });
    if (!routed) unclassified++;
  }
  for (const ex of (s.exposures || [])) {
    const cls = classify(ex);
    if (cls === 'UNENDED') { unended++; unclassified++; }
    const hits = ex.hits || [];
    const monHits = hits.filter(function (h) { return h.targetKind === 'monster'; });
    const leadHits = monHits.filter(function (h) { return h.sourceClass === 'leader'; });
    const allyHits = monHits.filter(function (h) { return h.sourceClass === 'ally'; });
    const abHits = monHits.filter(function (h) { return h.sourceClass === 'ability-or-trick'; });
    const otherHits = monHits.filter(function (h) { return h.sourceClass === 'other'; });
    const playerHits = hits.filter(function (h) { return h.targetKind !== 'monster'; });
    const beastHp = (ex.monsters || []).reduce(function (a, m) { return a + (m.maxHp || 0); }, 0);
    const beastStart = (ex.monsters || []).reduce(function (a, m) { return a + (m.hpStart != null ? m.hpStart : (m.maxHp || 0)); }, 0);
    const dealt = sum(monHits.map(hitDealt));
    const lead = sum(leadHits.map(hitDealt));
    const ally = sum(allyHits.map(hitDealt));
    const ab = sum(abHits.map(hitDealt));
    const taken = sum(playerHits.map(hitDealt));
    const rounds = ex.end ? ex.end.round : null;
    const turns = (ex.turns || []).length + ((ex.openingActions || []).length ? 1 : 0);
    const strikes = (ex.turns || []).reduce(function (n, t) {
      return n + t.actions.filter(function (a) { return a.kind === 'strike'; }).length;
    }, 0);
    const abilities = (ex.abilityUses || []).map(function (a) { return a.args ? a.args.join(':') : a.fn; });
    const leadVid = ex.leadVid;
    const party = ex.party || [];
    const leadGear = party.find(function (p) { return p.vid === leadVid; });
    const compFled = (ex.end && ex.end.humansFled || []).filter(function (v) { return v !== ex.leadVid; });
    const row = { seed: s.seed, day: ex.day, mid: ex.mid, class: cls,
      party: ex.partySizeStart, rounds: rounds, turns: turns,
      compFled: compFled,
      opening: (ex.openingActions || []).map(function (a) { return a.fn; }),
      openingHits: ex.openingHits || [],
      strikes: strikes, leadHits: leadHits.length, allyHits: allyHits.length,
      abHits: abHits.length, otherHits: otherHits.length,
      leadDmg: lead, allyDmg: ally, abDmg: ab, dealt: dealt,
      reqSum: sum(monHits.map(function (h) { return h.requested || 0; })),
      retSum: sum(monHits.map(function (h) { return (typeof h.returned === 'number' ? h.returned : 0); })),
      beastMax: beastHp, beastStart: beastStart,
      fracMax: beastHp ? dealt / beastHp : null,
      fracStart: beastStart ? dealt / beastStart : null,
      taken: taken, npcTurns: (ex.npcTurns || []).length,
      weapon: leadGear && leadGear.gear ? leadGear.gear.weapon : null,
      armorP: leadGear && leadGear.gear ? leadGear.gear.armorP : null,
      armed: leadGear && leadGear.gear ? leadGear.gear.armed : null,
      defArmor: ex.def ? ex.def.armor : null,
      defHp: ex.def ? ex.def.hp : null,
      defAtk: ex.def ? ex.def.attackDamage : null,
      abilities: abilities, trickKnown: ex.trickKnown,
      leadHpStart: leadGear ? leadGear.hpStart : null,
      leadHpEnd: (ex.end && ex.end.humans) ? (function () { const h = ex.end.humans.find(function (x) { return x.vid === leadVid; }); return h ? h.hp : null; })() : null,
      killRows: ex.kills || [],
    };
    tbRows.push(row);
    for (const k of (ex.kills || [])) killDetails.push({ seed: s.seed, channel: 'tb', exSeq: ex.seq, row: row, kill: k });
  }
  for (const ff of (s.fieldFights || [])) {
    fieldRows.push({ seed: s.seed, day: ff.day, vid: ff.vid, mid: ff.mid,
      outcome: ff.outcome, rounds: ff.rounds, vTaken: ff.vTaken, mDealt: ff.mDealt,
      vHpLeft: ff.vHpLeft, mHpLeft: ff.mHpLeft, partySize: ff.partySize,
      intent: ff.intent, intentWhy: ff.intentWhy, allyDealt: ff.allyDealt,
      weapon: ff.pre && ff.pre.gear ? ff.pre.gear.weapon : null,
      armorP: ff.pre && ff.pre.gear ? ff.pre.gear.armorP : null,
      defArmor: ff.pre && ff.pre.def ? ff.pre.def.armor : null,
      mHpStart: ff.pre ? ff.pre.mHpStart : null,
      killsDuring: ff.killsDuring || [], deathsDuring: ff.deathsDuring || [],
      logTail: (ff.log || []).slice(-6) });
    for (const k of (ff.killsDuring || [])) killDetails.push({ seed: s.seed, channel: 'field', callId: ff.callId, ff: ff, kill: k });
  }
  // Field kills recorded AFTER the fieldFight call returns (comms
  // wrapper) carry fieldCall null but lastField stamps; attribute an
  // unlinked row to the field fight iff same day + same killer vid +
  // same mid. Anything left is genuinely unexplained.
  for (const k of (s.killRows || [])) {
    if (k.linkSeq != null || k.fieldCall != null) continue;
    const ff = (s.fieldFights || []).find(function (x) {
      return x.day === k.day && x.vid === k.by && x.mid === k.mid;
    });
    if (ff) {
      killDetails.push({ seed: s.seed, channel: 'field-attributed', callId: ff.callId, ff: ff, kill: k });
    } else {
      killDetails.push({ seed: s.seed, channel: 'UNEXPLAINED', callId: null, ff: null, kill: k });
      unclassified++;
    }
  }
  for (const vid of Object.keys(s.killerTrace || {})) {
    const tr = s.killerTrace[vid];
    const kills = tr.kills || [];
    for (const k of kills) {
      const deathsAfter = (tr.deaths || []).filter(function (d) { return d.day >= k.day; });
      const first = deathsAfter[0] || null;
      killerTraces.push({ seed: s.seed, vid: vid, killDay: k.day, mid: k.mid, via: k.via,
        channel: k.linkHow || (k.fieldCall != null ? 'field' : 'unknown'),
        fieldCall: k.fieldCall, tbSeq: k.tbSeq,
        aliveAtEnd: tr.aliveAtEnd,
        deathDay: first ? first.day : null, deathCause: first ? first.cause : null,
        deathKind: first ? first.kind : null,
        deathSameCall: first ? (first.fieldCall === k.fieldCall && k.fieldCall != null) : null,
        deathSameTb: first ? (first.tbSeq === k.tbSeq && k.tbSeq != null) : null,
        daysSurvived: first ? (first.day - k.day) : (s.days - k.day),
        allDeaths: tr.deaths || [] });
    }
  }
}

const clsCounts = {};
for (const r of tbRows) clsCounts[r.class] = (clsCounts[r.class] || 0) + 1;
const lost = tbRows.filter(function (r) { return r.class === 'fighter-died'; });
const kills = tbRows.filter(function (r) { return r.class === 'kill'; });
const fled = tbRows.filter(function (r) { return r.class === 'fled'; });

console.log('=== SEEDS ===');
for (const s of seeds) {
  console.log('seed ' + s.seed + ' days ' + s.days + ' end ' + s.endReason + ' maxWave ' + s.maxWave +
    ' spawnsW4 ' + s.spawnsW4 + ' tb ' + s.exposures.length + ' fieldW4 ' + s.fieldCallsW4 +
    ' fieldDecomp ' + (s.fieldFights || []).length + ' kills ' + s.killsW4 +
    ' errors ' + (s.instrumentErrors || []).length);
}
console.log('=== TB CENSUS === total ' + tbRows.length + ' ' + JSON.stringify(clsCounts) +
  ' unended ' + unended + ' unclassified ' + unclassified + ' instrumentErrors ' + instrumentErrors);
console.log('orphans: ' + orphans.length + ' ' + JSON.stringify(orphans.map(function (o) { return o.seed + ':' + o.day + ':' + o.result + ':' + o.class; })));
console.log('=== TB PER-EXPOSURE ===');
for (const r of tbRows) {
  console.log([r.seed, 'd' + r.day, r.mid, r.class, 'pty' + r.party, 'r' + r.rounds, 't' + r.turns,
    'open:' + r.opening.join(','), 'openHits:' + r.openingHits.length,
    'str' + r.strikes, 'leadHit' + r.leadHits, 'allyHit' + r.allyHits,
    'abHit' + r.abHits, 'lead' + r.leadDmg, 'ally' + r.allyDmg, 'ab' + r.abDmg, 'dealt' + r.dealt,
    'req' + r.reqSum, 'ret' + r.retSum, 'max' + r.beastMax, 'start' + r.beastStart,
    'fracMax' + (r.fracMax != null ? r.fracMax.toFixed(3) : 'n/a'),
    'fracStart' + (r.fracStart != null ? r.fracStart.toFixed(3) : 'n/a'),
    'taken' + r.taken, 'wpn:' + r.weapon, 'armP:' + r.armorP, 'defArm:' + r.defArmor,
    'hp:' + r.leadHpStart + '->' + r.leadHpEnd,
    'ab:' + r.abilities.join('|'),
    (r.compFled.length ? 'compFled:' + r.compFled.join(',') : '')].join(' '));
}
console.log('=== LOST-FIGHT MEDIANS (n=' + lost.length + ') ===');
console.log('rounds ' + med(lost.map(function (r) { return r.rounds || 0; })) +
  ' turns ' + med(lost.map(function (r) { return r.turns; })) +
  ' strikes ' + med(lost.map(function (r) { return r.strikes; })) +
  ' dealtFracMax ' + (med(lost.map(function (r) { return r.fracMax || 0; })) || 0).toFixed(3) +
  ' dealtFracStart ' + (med(lost.map(function (r) { return r.fracStart || 0; })) || 0).toFixed(3) +
  ' taken ' + med(lost.map(function (r) { return r.taken; })) +
  ' leadDmgPerHit ' + (function () { const d = lost.filter(function (r) { return r.leadHits > 0; }).map(function (r) { return r.leadDmg / r.leadHits; }); return d.length ? med(d).toFixed(1) : 'n/a'; })());
console.log('=== OPENING (ROUND 1) ===');
(function () {
  let withActions = 0, withHits = 0, totalHits = 0;
  const actors = {};
  for (const s of seeds) for (const ex of (s.exposures || [])) {
    if ((ex.openingActions || []).length) withActions++;
    if ((ex.openingHits || []).length) { withHits++; totalHits += ex.openingHits.length; }
    for (const h of (ex.openingHits || [])) {
      const a = (h.sourceLabel || '?') + '/' + (h.sourceKey == null ? '?' : h.sourceKey);
      actors[a] = (actors[a] || 0) + 1;
    }
  }
  console.log('exposures ' + tbRows.length + ' with openingActions ' + withActions + ' with openingHits ' + withHits + ' total opening hits ' + totalHits + ' actors ' + JSON.stringify(actors));
})();
console.log('=== DAMAGE PER STRIKE (leader hits, all TB) ===');
(function () {
  const per = [];
  for (const s of seeds) for (const ex of (s.exposures || [])) for (const h of (ex.hits || [])) {
    if (h.targetKind === 'monster' && h.sourceClass === 'leader') per.push({ req: h.requested, ret: h.returned, dealt: hitDealt(h) });
  }
  const dealt = per.map(function (x) { return x.dealt; });
  const req = per.map(function (x) { return x.req || 0; });
  console.log('n ' + per.length + ' median dealt ' + (med(dealt) || 0).toFixed(1) + ' mean dealt ' + (dealt.length ? (sum(dealt) / dealt.length).toFixed(1) : 0) +
    ' median requested ' + (med(req) || 0).toFixed(1) + ' zero-damage hits ' + dealt.filter(function (x) { return x <= 0; }).length);
})();
console.log('=== ABILITY DAMAGE (all TB) ===');
(function () {
  const per = [];
  for (const s of seeds) for (const ex of (s.exposures || [])) for (const h of (ex.hits || [])) {
    if (h.targetKind === 'monster' && h.sourceClass === 'ability-or-trick') per.push(hitDealt(h));
  }
  console.log('n ' + per.length + ' total ' + sum(per) + ' median ' + (per.length ? med(per) : 'n/a'));
})();
console.log('=== BEAST DAMAGE PER ROUND (lost fights; finishers split out) ===');
(function () {
  const perRound = [];
  const finishers = [];
  for (const s of seeds) for (const ex of (s.exposures || [])) {
    const cls = classify(ex);
    if (cls !== 'fighter-died') continue;
    const byRound = {};
    for (const h of (ex.hits || [])) {
      if (h.targetKind === 'monster') continue;
      if (h.phase !== 'npc-turn') continue;
      if ((h.requested || 0) >= 9000) { finishers.push(hitDealt(h)); continue; }
      const k = h.round == null ? '?' : h.round;
      byRound[k] = (byRound[k] || 0) + hitDealt(h);
    }
    for (const k of Object.keys(byRound)) perRound.push(byRound[k]);
  }
  console.log('normal monster-turn damage rounds n ' + perRound.length + ' median ' + (perRound.length ? med(perRound) : 'n/a') + ' mean ' + (perRound.length ? (sum(perRound) / perRound.length).toFixed(1) : 0));
  console.log('finisher hits n ' + finishers.length + ' dealt ' + JSON.stringify(finishers));
  const takenNoFin = lost.map(function (r) {
    return r.taken;
  });
  console.log('lost-fight taken median (incl finishers, for reference) ' + med(takenNoFin));
})();
console.log('=== FIELD CENSUS === total ' + fieldRows.length);
(function () {
  const oc = {};
  for (const f of fieldRows) oc[f.outcome] = (oc[f.outcome] || 0) + 1;
  console.log(JSON.stringify(oc));
  for (const f of fieldRows) {
    console.log([f.seed, 'd' + f.day, f.mid, f.outcome, 'r' + f.rounds, 'pty' + f.partySize,
      'vTaken' + f.vTaken, 'mDealt' + f.mDealt, 'vHpLeft' + f.vHpLeft, 'mHpLeft' + f.mHpLeft,
      'mHpStart:' + f.mHpStart,
      'ally' + f.allyDealt, 'intent:' + f.intent + '/' + f.intentWhy,
      'wpn:' + f.weapon, 'armP:' + f.armorP, 'defArm:' + f.defArmor,
      'kills:' + f.killsDuring.length, 'deaths:' + f.deathsDuring.length].join(' '));
  }
})();
console.log('=== KILL DETAILS ===');
for (const k of killDetails) {
  if (k.channel === 'tb') {
    console.log([k.seed, 'TB', 'd' + k.kill.day, k.kill.mid, 'by ' + k.kill.by, 'via ' + k.kill.via,
      'pty' + k.row.party, 'r' + k.row.rounds, 'str' + k.row.strikes, 'lead' + k.row.leadDmg,
      'ally' + k.row.allyDmg, 'ab' + k.row.abDmg, 'beastStart' + k.row.beastStart, 'beastMax' + k.row.beastMax,
      'wpn:' + k.row.weapon].join(' '));
  } else if (k.channel === 'UNEXPLAINED') {
    console.log([k.seed, 'UNEXPLAINED-KILL', 'd' + k.kill.day, k.kill.mid, 'by ' + k.kill.by, 'via ' + k.kill.via].join(' '));
  } else {
    console.log([k.seed, k.channel.toUpperCase(), 'd' + k.kill.day, k.kill.mid, 'by ' + k.kill.by, 'via ' + k.kill.via,
      'r' + k.ff.rounds, 'pty' + k.ff.partySize, 'mDealt' + k.ff.mDealt, 'vTaken' + k.ff.vTaken,
      'ally' + k.ff.allyDealt, 'vHpLeft' + k.ff.vHpLeft, 'mHpLeft' + k.ff.mHpLeft,
      'mHpStart:' + (k.ff.pre ? k.ff.pre.mHpStart : null),
      'wpn:' + (k.ff.pre && k.ff.pre.gear ? k.ff.pre.gear.weapon : null)].join(' '));
  }
}
console.log('=== KILLER TRACES ===');
for (const tr of killerTraces) {
  console.log([tr.seed, tr.vid, 'kill d' + tr.killDay, tr.mid, tr.via, tr.channel,
    'aliveAtEnd:' + tr.aliveAtEnd,
    tr.deathDay != null ? ('died d' + tr.deathDay + ' cause:' + tr.deathCause + ' kind:' + tr.deathKind +
      ' sameCall:' + tr.deathSameCall + ' sameTb:' + tr.deathSameTb) : 'NO-DEATH-RECORDED',
    'survived ' + tr.daysSurvived + 'd'].join(' '));
}
console.log('=== LEVER MATH ===');
(function () {
  const beastMax = tbRows.map(function (r) { return r.beastMax; }).filter(function (x) { return x > 0; });
  const dps = [];
  for (const s of seeds) for (const ex of (s.exposures || [])) for (const h of (ex.hits || [])) {
    if (h.targetKind === 'monster' && h.sourceClass === 'leader') dps.push(hitDealt(h));
  }
  const medDps = med(dps) || 0;
  const medBeast = med(beastMax) || 0;
  const medRounds = med(lost.map(function (r) { return r.rounds || 0; })) || 0;
  const medStrikes = med(lost.map(function (r) { return r.strikes; })) || 0;
  const medTaken = med(lost.map(function (r) { return r.taken; })) || 0;
  console.log('median beast maxHp ' + medBeast + ' median leader dmg/strike ' + medDps.toFixed(1) +
    ' strikes-to-kill at median dps ' + (medDps ? (medBeast / medDps).toFixed(1) : 'n/a') +
    ' median lost-fight strikes ' + medStrikes + ' rounds ' + medRounds +
    ' strikes/round ' + (medRounds ? (medStrikes / medRounds).toFixed(2) : 'n/a'));
  console.log('median damage taken in lost fights ' + medTaken + ' (fighter HP 100; rounds survived at median taken/round ' +
    (medRounds ? (medTaken / medRounds).toFixed(1) : 'n/a') + '/round)');
  console.log('to kill at current strike rate: need ' + (medDps && medStrikes ? (medBeast / medDps / Math.max(1, medStrikes)).toFixed(2) + 'x current strikes' : 'n/a') +
    '; to kill in current rounds: need ' + (medRounds && medDps ? (medBeast / medRounds / medDps).toFixed(2) + ' strikes/round' : 'n/a') +
    '; to kill at current strikes: need ' + (medStrikes ? (medBeast / medStrikes).toFixed(1) + ' dmg/strike' : 'n/a'));
  console.log('kills per TB exposure ' + (tbRows.length ? (kills.length / tbRows.length).toFixed(3) : 0) +
    ' kills per fieldW4 fight ' + (fieldRows.length ? (fieldRows.filter(function (f) { return f.outcome === 'vKill'; }).length / fieldRows.length).toFixed(3) : 0) +
    ' killers alive at end ' + killerTraces.filter(function (t) { return t.aliveAtEnd; }).length + '/' + killerTraces.length);
})();
