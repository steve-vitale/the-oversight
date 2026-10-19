#!/usr/bin/env node
// journey-landing-r28-analyze.js — gate verdicts from r28 census JSONs.
// Usage: node scripts/journey-landing-r28-analyze.js <census-glob...>
const fs = require('fs');
const files = process.argv.slice(2);
const out = [];
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(f, 'utf8'));
  const va = c.villageAutonomy || {};
  const perV = va.perVillager || [];
  const v1fail = perV.filter(p => !p.v1ppPass).map(p => `${p.name}(${p.coverageDays}/${p.observedDays})`);
  const v3 = c.socialStructure || {};
  const s = {
    seed: c.seed,
    systemDay: c.systemDay,
    over: c.overAt,
    pop: c.census ? c.census.filter(p => p.alive).length : null,
    deaths: (c.deaths || []).map(d => `${d.who||'?'} d${d.day} ${d.cause||''}`.slice(0, 80)),
    V1: { go: perV.length > 0 && v1fail.length === 0, fails: v1fail },
    hungerOver90Frac: va.hungerOver90Frac,
    V2: { totalProduced: va.totalProduced, selfSufficiency: va.selfSufficiency, effortRatio: va.effortRatio },
    V3: { trustPairs40: (v3.trustPairs40 || []).map(t => `${t.name}:${t.trust}`), moots: (c.series || []).filter(x => x.moot).length, favorInstances: v3.favorInstances },
    water: c.wateR14 ? { fills: c.wateR14.fills, boils: c.wateR14.boils } : null,
    deaths13: c.deaths13 ? { playerDeaths: (c.deaths13.playerDeaths || []).length, mislabels: c.deaths13.mislabels.length } : null,
    namesKnownMax: Math.max.apply(null, [0].concat((c.series || []).map(x => x.namesKnown || 0))),
    preSystemTrustMax: c.preSystemTrustMax,
    starvationDeaths: c.starvAutopsies ? c.starvAutopsies.length : 0,
    transcripts: (c.transcriptFiles || []).length,
    folFires: (c.folTelemetry && c.folTelemetry.fires || []).map(x => `${x.name} d${x.day} t=${x.trustAtFire}`),
    fleshArc: (c.fleshArc && c.fleshArc.transitions || []).map(t => `${t.mid} d${t.day} ${t.how}${t.testedBy ? ' by ' + t.testedBy : ''}`),
    monsterKills: (c.monsterKills || []).map(k => `${k.monsterId} d${k.day} ${k.cause}`),
    mantle: c.mantleLog || [],
    favorPromised: c.ctx.favorPromised || 0,
  };
  out.push(s);
}
console.log(JSON.stringify(out, null, 1));
