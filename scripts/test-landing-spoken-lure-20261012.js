#!/usr/bin/env node
// Journey LANDING r4 blank — SPOKEN LURE proof test (2026-10-12).
// Bug: a pending betrayal invite surfaced ONLY as betrayal:accept/decline
// menu choices — the NPC never spoke the invitation, so the player accepted
// or declined something they were never asked (and could walk blind into an
// armed plot: acceptInvite springs the ambush).
// Fix: the pending invite is spoken as a second opener beat (conversation.js),
// once per pending; accept/decline still consume the pending normally.
//
// RED on pristine: opener lacks the lure while accept/decline are offered.
// GREEN fixed: opener speaks the lure; accept resolves; decline clears;
// the lure is not re-spoken on a second conversation with the same pending.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 515;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k, v) { delete this._m[k]; },
};
global.window = global;
const files = [];
for (const line of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')) {
  const m = /src\/js\/[^"]*\.js/.exec(line);
  if (m && !/app\.js|tile-scenes\.js|move-anim\.js|drama\.js|sprites\.js/.test(m[0])) files.push(m[0]);
}
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}


function forcePending(vid, defId) {
  const h = Game.inviteHistory(vid);
  h.pending = { defId: defId || 'air', day: (Game.state.scholar || {}).day || 1 };
  return h.pending;
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  let vid = null;
  for (const id of roster) {
    try { if (Game.npcComm && Game.npcComm(id).level === 'none') continue; } catch (e) {}
    vid = id; break;
  }
  vid = vid || roster[0];
  // trust up so npcInviteTick can fire (needs avg ~15)
  for (const id of roster) Game.bumpTrust(id, 20, 'test');

  // force a pending invite deterministically
  const inv = forcePending(vid, 'look');
  ok(!!inv, 'pending invite exists for ' + Game.displayName(vid));

  // A: opener speaks the lure, menu offers accept/decline
  const r0 = Game.startConvo(vid);
  const def = (Game.INVITE_DEFS() || []).find(d => d.id === (inv && inv.defId));
  const lureText = def ? def.label.replace(/^"|"$/g, '') : null;
  const ids = (r0.choices || []).map(c => c && c.id);
  ok(ids.includes('betrayal:accept') && ids.includes('betrayal:decline'),
    'menu offers betrayal:accept/decline');
  // R5 (journey establishment 2026-10-12): the lure speaks as its OWN second
  // opener beat (a THEM transcript entry), not space-glued onto the opener
  // line ("...you and me?" "Come get air with me..." — three discourse moves
  // in one breath). The guarantee stands: the NPC speaks the invite so the
  // accept/decline choices make sense; the hygiene is new.
  const themHas = (r, txt) => (r.transcript || []).some(e => e.who === 'them' && String(e.text || '').includes(txt));
  ok(!!lureText && themHas(r0, lureText),
    'opener SPEAKS the lure as its own beat (' + (lureText || 'none') + ')');
  ok(!!lureText && !String(r0.line || '').includes(lureText),
    'lure is NOT glued onto the opener line');
  console.log('  opener: ' + String(r0.line || '').slice(0, 220));

  // B: declining clears the pending and the NPC line is coherent
  const rd = Game.convoTurn(vid, 'betrayal:decline');
  ok(!Game.pendingInvite(vid), 'decline consumes the pending invite');
  ok(/Another time/i.test(String(rd.line || '')) || /train of thought|Never mind|forget it/i.test(String(rd.line || '')),
    'decline gets a spoken response (' + String(rd.line || '').slice(0, 80) + ')');
  Game.endConvo(vid, 'done');

  // C: a fresh pending invite spoken once — second sitting does not repeat it
  const inv2 = forcePending(vid, 'carry');
  ok(!!inv2, 'second pending invite created');
  const r1 = Game.startConvo(vid);
  const def2 = (Game.INVITE_DEFS() || []).find(d => d.id === (inv2 && inv2.defId));
  const lure2 = def2 ? def2.label.replace(/^"|"$/g, '') : null;
  ok(!!lure2 && themHas(r1, lure2), 'first sitting with new pending speaks the lure');
  Game.endConvo(vid, 'done');
  const r2 = Game.startConvo(vid); // same pending still open, not accepted/declined
  ok(!(lure2 && themHas(r2, lure2)),
    'second sitting does NOT re-speak the same lure');
  Game.endConvo(vid, 'done');

  // D: accepting still resolves the invite (no plot here — honest invite)
  const inv3 = forcePending(vid, 'traps');
  if (inv3) {
    const r3 = Game.startConvo(vid);
    const ra = Game.convoTurn(vid, 'betrayal:accept');
    ok(!Game.pendingInvite(vid), 'accept consumes the pending invite');
    ok(!!ra && !!ra.line, 'accept produces a resolution line');
    Game.endConvo(vid, 'done');
  } else {
    ok(false, 'third pending invite created (accept path)');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
