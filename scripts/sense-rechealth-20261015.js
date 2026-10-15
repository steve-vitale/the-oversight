#!/usr/bin/env node
// sense-rechealth-20261015.js — SENSE-TESTING for the thriving-village
// exemption recovery throttle on the courtship road: read the post-death
// recovery transcripts AND the exempted (no-hold) deaths.
//
// SENSE-TESTING LAW: judge meaning, coherence, relevance — never just
// counts. Two questions this pass: (1) do the engaged hold beats still read
// as mourning and regrouping (r35/r37 verdict carried); (2) do the EXEMPTED
// deaths read sanely — a shallow-pantry/hungry village keeps ranging after
// a death with no guard-posture line. Is the silence honest, or does the
// village read as not-caring? The layer says nothing on exemption by design;
// the engine's own grief beats (Codex pages, funeral beats) carry the
// mourning. Read both sides and judge.
'use strict';
process.env.FOURTHLINK = '1';
process.env.RECHEALTH = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// Kill-protocol graceful degradation: INFO-SKIP when the layer is absent
// (never MODULE_NOT_FOUND).
let rechealth = null;
try { ({ rechealth } = require('./policies/rechealth')); }
catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: rechealth layer absent (killed or not yet built).');
    process.exit(0);
  }
  throw e;
}

const SAYRE = /nobody ranges|holds Haven|sets a watch|mantle|died|dead|grief|funeral|🕯|Crews stay/i;

async function main() {
  const seed = parseInt(process.env.SEEDS || '66', 10);
  const { Game } = await loadGame({ seed, mode: 'rechealth-sense', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (SAYRE.test(text) && lines.length < 160) {
        lines.push({ day: gday(), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260) });
      }
    } catch (e) {}
    return origSay(msg);
  };
  const wrapped = Object.assign({}, rechealth, { id: rechealth.id + '+sense' });
  let lastExempted = 0;
  const origDaily = rechealth.daily;
  wrapped.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    try {
      const ex = ctx._recExempted || 0;
      if (ex > lastExempted) {
        lastExempted = ex;
        const d = (ctx._recDeaths || []).filter(x => x.exempted).pop();
        if (d && lines.length < 160) {
          lines.push({ day: gday(), text: `[EXEMPTED, no hold] ${d.who} died — ${d.cause} (person, combat). The scholar keeps ranging.` });
        }
      }
    } catch (e) {}
    return r;
  };
  await quietLog(() => runDays(Game, wrapped, { days: 150, sampleEvery: 10 }));
  console.log(`--- sense transcript: seed ${seed}, ${lines.length} lines ---`);
  for (const l of lines) console.log(`[d${l.day}] ${l.text}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
