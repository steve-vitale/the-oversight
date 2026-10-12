#!/usr/bin/env node
// PROOF: undecided lure invitations are re-spoken next sitting
// (journey landing r8 2026-10-12).
//
// OBSERVED (r8 sims: lureSilent=2/8): the inviteBeat sets inv.spoken=true
// "once per pending" — but a sitting can end without the player deciding
// (walked away, modal cutoff when tapping another villager, or the sim
// harness's own policy talkRound opening/closing conversations for social
// maintenance). The NEXT sitting's menu still offered betrayal:accept/
// decline quoting the invitation VERBATIM, while the NPC never spoke it in
// THAT conversation — the exact blind-accept failure the spoken-lure fix
// exists to prevent (armed-plot invites travel the same channel; the r8
// case was a plotId-carrying 'traps' invite).
//
// Fixed (src/js/conversation.js): when a conversation ends with the invite
// still pending (undecided), inv.spoken resets — the next sitting speaks
// the invitation again. The menu quotes the label verbatim, so the spoken
// beat and the menu can never disagree (r7 principle). Accept/decline
// consume the pending, so decided invites never re-fire. Repetition reads
// as insistence, not parrot. Applied at both conversation ends: endConvo
// and the modal cutoff in startConvo.
//
// RED on pristine HEAD: second sitting offers the menu with no spoken beat
// (FAIL). GREEN fixed: the beat is re-spoken (PASS).
//
// Usage: node scripts/test-landing-lure-respeak-20261012.js
//   RED:  CONVO_FILE=/tmp/pristine-conversation.js node scripts/test-landing-lure-respeak-20261012.js
//         (build /tmp/pristine-conversation.js via: git show HEAD:src/js/conversation.js > /tmp/pristine-conversation.js)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 31337;
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
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const CONVO_OVERRIDE = process.env.CONVO_FILE || null;
const EXCLUDE = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="([^"]+)"/g)) {
  const f = m[1].split('?')[0];
  if (!f.endsWith('.js')) continue;
  if (EXCLUDE.has(path.basename(f))) continue;
  let srcPath = path.join(ROOT, f);
  if (CONVO_OVERRIDE && path.basename(f) === 'conversation.js') srcPath = CONVO_OVERRIDE;
  eval(fs.readFileSync(srcPath, 'utf8'));
}
delete global.window;
const Game = globalThis.Scattering.Game;
if (CONVO_OVERRIDE) console.log('NOTE: conversation.js loaded from PRISTINE override: ' + CONVO_OVERRIDE);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const defs = Game.INVITE_DEFS();
  const def = defs.find(d => d.id === 'traps') || defs[0];
  const LABEL_CORE = 'trap line'; // inside the invite label text
  const day = (Game.state.scholar && Game.state.scholar.day) || 1;
  const themOf = (vid) => (Game.convoGet(vid).transcript || [])
    .filter(e => e.who === 'them').map(e => String(e.text)).join('\n');
  const menuOffers = (vid) => {
    const ch = (Game.convoChoices(vid) || []);
    return ch.some(c => c && c.id === 'betrayal:accept');
  };

  // CASE 1: undecided invite is re-spoken next sitting.
  // Sitting 1: beat fires. Player walks away without deciding.
  // Sitting 2: menu offers accept/decline — the NPC must speak it again.
  const a = roster[0];
  Game.inviteHistory(a).pending = { defId: def.id, day };
  Game.startConvo(a);
  const t1a = themOf(a);
  const spoken1 = t1a.indexOf(LABEL_CORE) !== -1;
  Game.endConvo(a, 'left'); // walked away — no accept, no decline
  const pendingAfter = Game.pendingInvite(a);
  console.log('case1: sitting1 spoken=' + spoken1 + ' pendingSurvives=' + !!pendingAfter);
  ok(spoken1, 'sitting 1: invitation spoken (setup)');
  ok(!!pendingAfter, 'sitting 1: undecided invite still pending (setup)');
  Game.startConvo(a);
  const t1b = themOf(a);
  const spoken2 = t1b.indexOf(LABEL_CORE) !== -1;
  const offers2 = menuOffers(a);
  Game.endConvo(a, 'left');
  console.log('case1: sitting2 spoken=' + spoken2 + ' menuOffers=' + offers2);
  ok(offers2, 'sitting 2: menu still offers the undecided invitation (setup)');
  ok(spoken2, 'sitting 2: invitation re-spoken — menu and speech agree');

  // CASE 2: decided invite never re-fires. Accept consumes the pending.
  const b = roster[1];
  Game.inviteHistory(b).pending = { defId: def.id, day };
  Game.startConvo(b);
  const t2a = themOf(b);
  ok(t2a.indexOf(LABEL_CORE) !== -1, 'sitting 1: invitation spoken (setup)');
  try { Game.convoTurn(b, 'betrayal:accept'); } catch (e) {}
  try { Game.endConvo(b, 'done'); } catch (e) {}
  const pendingB = Game.pendingInvite(b);
  Game.startConvo(b);
  const t2b = themOf(b);
  const offersB = menuOffers(b);
  Game.endConvo(b, 'left');
  console.log('case2: pendingAfterAccept=' + !!pendingB + ' sitting2 menuOffers=' + offersB);
  ok(!pendingB, 'accept consumes the pending invite (setup)');
  ok(!offersB, 'decided invite: menu no longer offers it');
  ok(t2b.indexOf(LABEL_CORE) === -1, 'decided invite: no re-spoken beat');

  // CASE 3: modal cutoff resets too. Mid-conversation with A (invite spoken),
  // player taps B — A's conversation is force-ended. Next sitting with A
  // re-speaks the undecided invite.
  const c = roster[2], d = roster[3];
  Game.inviteHistory(c).pending = { defId: def.id, day };
  Game.startConvo(c);
  const t3a = themOf(c);
  ok(t3a.indexOf(LABEL_CORE) !== -1, 'sitting 1: invitation spoken (setup)');
  Game.startConvo(d); // modal cutoff force-ends c's conversation
  const cActive = (() => { try { return !!(Game.convoGet(c) || {}).active; } catch (e) { return 'err'; } })();
  console.log('case3: c active after modal cutoff: ' + cActive);
  Game.endConvo(d, 'left');
  Game.startConvo(c);
  const t3b = themOf(c);
  const spoken3 = t3b.indexOf(LABEL_CORE) !== -1;
  const offers3 = menuOffers(c);
  Game.endConvo(c, 'left');
  console.log('case3: sitting2 spoken=' + spoken3 + ' menuOffers=' + offers3);
  ok(offers3, 'after modal cutoff: menu still offers the undecided invitation (setup)');
  ok(spoken3, 'after modal cutoff: invitation re-spoken next sitting');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
