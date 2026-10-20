// ledgerdark — the dark-ledger road (sim-ledgerdark-road, 2026-10-20,
// flesh-out loop, axis scale-onramp, lever-10 win-path end to end).
//
// THE GAP (sim-tablepathdriver, 2026-10-20, named next #2): that arm walked
// relay/dark but no LEDGER dark branch. Its margins showed belongfeast's
// beloved at 2v1 dark-leaning (showmanship > protected*2, +2 dark) — one
// signal from the dark branch, never walked. Per docs/TABLE.md the
// light/dark axis is "earned through play — never a menu choice": the six
// non-relay paths resolve on the MORAL LEDGER (table.js tableBranch):
// killed vs protected, betrayed, foodShared vs foodHoarded, promises
// kept/broken, switchboard edited+skimmed vs routed. This layer builds a
// dark ledger pre-table through REAL verbs, so the driver can walk an
// honestly-offered dark door.
//
// DIAGNOSTIC (scripts/diag-ledgerdark-20261020.js, control substrate,
// day ~90): the ledger is nearly EMPTY on this substrate — foodShared
// 0-2, foodHoarded 0, killed 0, betrayed 0, promises kept/broken 0/0,
// showmanship 11-13, protected 34-35 (leadfeast) / 0-14 (belongfeast).
// So the road is ADDITIVE, not suppressive: the base barely shares, so no
// donation-suppression is needed (and suppressing would gut the feast
// substrate's contribution rule — scaleFeast needs recentGives+tribute).
// A few hoard events flip foodHoarded > foodShared; one betrayal adds the
// betrayed signals.
//
// THE PROGRAM (pre-registered, POLICY-SIDE, not canon):
//   1. REFUSE BEGS (withheld-sharing, real verb): Game.state.pendingBeg
//      -> Game.answerBeg('refuse'). The speaker walks back into the dark
//      with nothing; opinion -8; 30% raid comeback (the engine prices it).
//      Moral ledger: 'beg-refused' -> foodHoarded +1 (ledger.js
//      LEDGER_EVENT_DIMS.villageAgency). No policy answers begs today —
//      this verb is currently unplayed.
//   2. REFUSE AID BEGS: Game.state.pendingAidBeg -> Game.answerAidBeg
//      ('refuse'). Honest withholding; the trust cost is real.
//   3. HOARD TAKE (net-taker, real verb): once/day at Haven, pantry
//      healthy (pantryKcalLive > 15000), takeFromPantryBulk ~1200 kcal of
//      prepared food for the personal pack. Drives takes/gives net
//      negative -> the hoard detector fires -> hoardFood -> foodHoarded.
//      The village notices: trust -2/take, "Someone watches you load up",
//      the theftConfrontation trailing-7d rate check — the honest social
//      price of eating from the common pot and never putting back.
//   3.5. RECRUIT (the party to betray, real verb): days 15-27, once per run.
//      The substrate walks alone (no followers/parties) so the betrayal leg
//      would never fire. inviteToParty(vid) on the highest-trust living
//      villager (trust >= partyTrustFloor; System arrival + codex gates) —
//      the acceptance draw is the engine's seeded RNG. Gives the day-28-60
//      betrayal someone who walked with the bearer.
//   4. BETRAYAL (killed-over-protected, real combat): ONE playerAttacks on
//      a follower (else a party member) — someone who walked with you —
//      day 28-60, bearer HP >= 60%, not mid-fight. The layer's fight hook
//      owns the betrayal combat (strike the hostile, close distance — the
//      murder-spree pattern, fought to win, no pulled punches). The
//      fight's honest outcome writes the ledger: betrayed +1 always
//      (party.js: turning on party/followers); killed +3 if the victim
//      dies (ledger.js registerDeath wrap, kind 'villager'). The justice
//      ladder (confrontation -> moot -> sentence) plays out untouched.
// TARGETS (with margin): foodHoarded > foodShared (flip the food truth),
// betrayed >= 1, beloved branch dark at sitting (margin >= 4v2 on both
// policies if the road lands).
// STOP: the layer goes quiet once the invitation is staged
// (tablePreview() non-null) or the seat is taken — the road is over; it
// never perturbs the table window. Quiet when exiled or Game.over.
//
// COMPOSITION: withLedgerDark wraps the tribfloor base INSIDE the
// relaydark wrap (driver -> seatdrive -> windefer -> relaydark ->
// ledgerdark -> base). LEDGERDARK=1 is the env on-switch. Default-OFF:
// unset delegates to the base byte-identically (pinned by the probe's
// DET/FIDELITY=1 gates).
//
// POLICY-SIDE ONLY — zero src/js changes, zero new RNG draws (the layer
// never calls Math.random; the verbs draw the engine's seeded RNG).
// NEVER edit tablepathdriver.js, relaydark.js, seatdrive.js, windefer.js,
// or any landed 20261020 tablepathdriver instrument.
'use strict';

function layerOn() { return process.env.LEDGERDARK === '1'; }

function gday(Game) { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; } }

// ledgerVector(Game): the moral-ledger dark-road state. PURE reads.
function ledgerVector(Game) {
  const s = {
    killed: 0, prot: 0, betrayed: 0, shared: 0, hoarded: 0,
    showmanship: 0, might: 0, stance: null, beloved: null,
  };
  try {
    const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
    s.killed = (L.killed | 0); s.prot = (L.protected | 0);
    s.betrayed = (L.betrayed | 0);
    s.shared = (L.foodShared | 0); s.hoarded = (L.foodHoarded | 0);
    s.showmanship = (L.showmanship | 0); s.might = (L.might | 0);
  } catch (e) {}
  try { s.stance = (typeof Game.foodStance === 'function') ? Game.foodStance().key : null; } catch (e) {}
  try {
    const b = (typeof Game.tableBranch === 'function') ? Game.tableBranch('beloved') : null;
    if (b) s.beloved = { branch: b.branch, dark: b.dark | 0, light: b.light | 0 };
  } catch (e) {}
  return s;
}

function ensureLD(ctx) {
  let LD = ctx._ledgerdark;
  if (!LD) {
    LD = ctx._ledgerdark = {
      active: false,
      begsRefused: 0, begRefuseErr: 0,
      aidBegsRefused: 0,
      hoardTakes: 0, hoardTakeKcal: 0, hoardSkippedPantry: 0, hoardTakeErr: 0,
      recruitTried: 0, recruitDone: 0, recruitDay: null, recruitVictim: null,
      recruitRefused: 0, recruitErr: 0,
      betrayalDone: 0, betrayalDay: null, betrayalVictim: null,
      betrayalSkipped: 0, betrayalFight: 0, betrayalThrew: 0,
      stoppedTable: 0, quietExile: 0,
      ldError: 0,
    };
  }
  return LD;
}

function pantryKcal(Game) {
  try {
    const v = Game.state.village || {};
    return ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) | 0;
  } catch (e) { return 0; }
}

function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}

// pickHoardSelection(Game, wantKcal): build a {idx: qty} selection of
// prepared (non-raw) food totalling ~wantKcal, highest-kcal stacks first.
// Pure read of the pantry; the verb does the taking.
function pickHoardSelection(Game, wantKcal) {
  try {
    const pantry = (Game.state.village || {}).pantry || [];
    const cands = [];
    for (let i = 0; i < pantry.length; i++) {
      const it = pantry[i];
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.foodState === 'raw') continue; // prepared food first — the good stuff
      cands.push({ idx: i, kcalEach: it.kcalEach || 0, units: it.units || 0 });
    }
    cands.sort((a, b) => b.kcalEach - a.kcalEach);
    const sel = {};
    let acc = 0;
    for (const c of cands) {
      if (acc >= wantKcal) break;
      const need = Math.ceil((wantKcal - acc) / c.kcalEach);
      const q = Math.min(need, c.units);
      if (q > 0) { sel[c.idx] = q; acc += q * c.kcalEach; }
    }
    return Object.keys(sel).length ? { sel, kcal: acc } : null;
  } catch (e) { return null; }
}

function livingFollowerOrParty(Game) {
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const isAlive = (id) => {
      const rc = ((vv.rosterChars || {})[id]);
      return !rc || rc.alive !== false;
    };
    // followers first — someone who walks with you (the ledger's betrayed
    // signal is about party/followers specifically)
    for (const id of (vv.followers || [])) {
      if (id === me || !isAlive(id)) continue;
      if (typeof Game.isFollower === 'function' ? Game.isFollower(id) : true) return id;
    }
    // NB: use the engine's partyMembers() (roster-filtered), NOT the raw
    // v.party array — a departed villager can linger in the raw array, and
    // playerAttacks only writes betrayed+1 for real party/followers
    // (s64205: the road "betrayed" a roster-gone ghost — attack fired,
    // betrayed stayed 0, attribution gap).
    const members = (typeof Game.partyMembers === 'function')
      ? Game.partyMembers()
      : ((vv.party || []).filter(id => (vv.roster || []).includes(id)));
    for (const id of members) {
      if (id === me || !isAlive(id)) continue;
      return id;
    }
  } catch (e) {}
  return null;
}

// recruitCandidate(Game): the highest-trust living villager who isn't the
// bearer and isn't already traveling with them — the person the RECRUIT leg
// asks to walk with the bearer. Deterministic pick (highest trust); the
// invite's acceptance draw is the engine's seeded RNG (inviteToParty), never
// the layer's. Respects the System's own trust floor (partyTrustFloor, 20).
function recruitCandidate(Game) {
  try {
    const me = Game.villagerId;
    const v = Game.partyState();
    const traveling = new Set([me, ...((v.party || [])), ...((v.followers || []))]);
    const trust = v.trust || {};
    const floor = (typeof Game.partyTrustFloor === 'function') ? Game.partyTrustFloor() : 20;
    let best = null, bestTrust = -1;
    for (const id of (v.roster || [])) {
      if (traveling.has(id)) continue;
      const rc = ((Game.state.village || {}).rosterChars || {})[id];
      if (rc && rc.alive === false) continue;
      const t = (trust[id] == null ? 10 : trust[id]);
      if (t < floor) continue;
      if (t > bestTrust) { bestTrust = t; best = id; }
    }
    return best;
  } catch (e) { return null; }
}

function bearerHpFrac(Game) {
  try {
    const s = Game.state.scholar || {};
    const hp = s.health == null ? 100 : s.health;
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return hp / Math.max(1, maxHp);
  } catch (e) { return 1; }
}

// ledgerDarkDaily: the road's verbs, one day at a time. Read-only until
// each verb; every early exit is classified in ctx (never an attempt).
function ledgerDarkDaily(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never touch ctx
  const LD = ensureLD(ctx);
  LD.active = true;
  if (Game.over) return;
  const s = Game.state.scholar || {};
  if (s.exiled) { LD.quietExile = 1; return; }
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return;
  // The road ends where the table begins: once the invitation is staged
  // the layer goes quiet (never perturb the table window).
  let pv = null;
  try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
  if (pv) { LD.stoppedTable = 1; return; }
  const day = gday(Game);

  // 1. REFUSE BEGS — withheld-sharing, the real verb. No policy answers
  // begs today; each refusal is foodHoarded +1 on the moral ledger.
  try {
    if (Game.state.pendingBeg && typeof Game.answerBeg === 'function') {
      const r = Game.answerBeg('refuse');
      LD.begsRefused = (LD.begsRefused | 0) + 1;
      if (r == null) LD.begRefuseErr = (LD.begRefuseErr | 0) + 1;
    }
  } catch (e) { LD.begRefuseErr = (LD.begRefuseErr | 0) + 1; }
  // 2. REFUSE AID BEGS — the inter-village ask. Honest withholding; the
  // trust cost is real (safetynets: ingratitude is ledgered, travels).
  try {
    if (Game.state.pendingAidBeg && typeof Game.answerAidBeg === 'function') {
      Game.answerAidBeg('refuse');
      LD.aidBegsRefused = (LD.aidBegsRefused | 0) + 1;
    }
  } catch (e) {}

  // 3. HOARD TAKE — once/day at Haven, pantry healthy. The personal pack
  // from the common pantry; the net-taker detector does the ledgering.
  try {
    const tookToday = LD.hoardTakeDay === day;
    if (!tookToday && atHaven(Game) && !Game.tbfight &&
        typeof Game.takeFromPantryBulk === 'function') {
      const pk = pantryKcal(Game);
      if (pk <= 15000) {
        LD.hoardSkippedPantry = (LD.hoardSkippedPantry | 0) + 1;
      } else {
        const pick = pickHoardSelection(Game, 1200);
        if (pick) {
          // NOTE: takeFromPantryBulk always returns null (it narrates
          // "Packed:" on success) — detect the take by pantry movement.
          const before = pantryKcal(Game);
          try { Game.takeFromPantryBulk(pick.sel); } catch (e) { LD.hoardTakeErr = (LD.hoardTakeErr | 0) + 1; }
          const moved = before - pantryKcal(Game);
          if (moved > 0) {
            LD.hoardTakes = (LD.hoardTakes | 0) + 1;
            LD.hoardTakeKcal = (LD.hoardTakeKcal | 0) + (moved | 0);
            LD.hoardTakeDay = day;
          }
        }
      }
    }
  } catch (e) { LD.hoardTakeErr = (LD.hoardTakeErr | 0) + 1; }

  // 3.5 RECRUIT — days 15-27: give the betrayal someone to betray. The
  // substrate walks alone (no followers/parties), so the betrayal leg would
  // never fire. The REAL verb: inviteToParty (party.js — System arrival +
  // codex + trust floor gates). Highest-trust candidate; acceptance is the
  // engine's draw. One recruit per run; retries daily while no one travels
  // with the bearer (a refusal isn't fatal — someone else may say yes).
  try {
    if (!LD.recruitDone && day >= 15 && day <= 27 && !Game.tbfight &&
        typeof Game.inviteToParty === 'function' && typeof Game.partyUnlocked === 'function' &&
        Game.partyUnlocked() && !livingFollowerOrParty(Game)) {
      const vid = recruitCandidate(Game);
      if (vid) {
        let r = null;
        try { r = Game.inviteToParty(vid); } catch (e) { LD.recruitErr = (LD.recruitErr | 0) + 1; }
        LD.recruitTried = (LD.recruitTried | 0) + 1;
        if (r && r.ok) {
          LD.recruitDone = 1; LD.recruitVictim = vid; LD.recruitDay = day;
        } else {
          LD.recruitRefused = (LD.recruitRefused | 0) + 1;
        }
      }
    }
  } catch (e) { LD.recruitErr = (LD.recruitErr | 0) + 1; }

  // 4. BETRAYAL — one per run, day 28-60, bearer healthy, not mid-fight.
  // Someone who walked with you. The fight hook below owns the combat.
  try {
    if (!LD.betrayalDone && day >= 28 && day <= 60 && !Game.tbfight &&
        bearerHpFrac(Game) >= 0.6 && typeof Game.playerAttacks === 'function') {
      const victim = livingFollowerOrParty(Game);
      if (!victim) {
        LD.betrayalSkipped = (LD.betrayalSkipped | 0) + 1;
      } else {
        let r = false;
        try { r = Game.playerAttacks(victim); } catch (e) { LD.betrayalThrew = (LD.betrayalThrew | 0) + 1; }
        if (r) {
          LD.betrayalDone = 1; LD.betrayalDay = day; LD.betrayalVictim = victim;
          LD.betrayalFight = 1; // the fight hook owns this combat
        } else {
          LD.betrayalSkipped = (LD.betrayalSkipped | 0) + 1;
        }
      }
    }
  } catch (e) { LD.betrayalThrew = (LD.betrayalThrew | 0) + 1; }
  if (!Game.tbfight) LD.betrayalFight = 0; // the combat resolved
}

// advanceTurn(Game): move the turn index to the next live fighter, exactly
// as the engine's (party.js-wrapped) tbAdvance would after a completed turn:
// round wrap + tbRoundWrap + tbEndCheck + tbBeginTurn on landing on the
// player. Deterministic, no RNG.
function advanceTurn(Game) {
  const f = Game.tbfight;
  if (!f || f.over) return;
  let guard = 0;
  while (guard++ < 10) {
    f.turnIdx++;
    if (f.turnIdx >= f.order.length) {
      f.turnIdx = 0; f.round++;
      try { Game.tbRoundWrap(f); } catch (e) {}
    }
    try { if (Game.tbEndCheck()) return; } catch (e) {}
    let c = null;
    try { c = Game.tbFighter(f.order[f.turnIdx]); } catch (e) {}
    if (!c || !c.alive || c.fled) continue;
    if (c.kind === 'player') { try { Game.tbBeginTurn(); } catch (e) {} }
    return;
  }
}

// driveHostileTurn(Game): the betrayal victim's REAL turn through the
// engine's hostile AI (party.js tbHostileTurn, routed there by party.js's
// tbAdvance wrap: beg / yield / freeze / flee / desperate fight), then
// advance. The harness never drives a non-player opening turn — without
// this, a hostile-first turn order leaves the fight live forever and the
// day clock freezes (the day-28 smoke stall: 30 loop-days consumed with
// the scholar day stuck at 28). This mirrors the node engine's own
// behavior. (The browser's async stepper instead calls tbMonsterTurn
// directly on the mdef-less human fighter, throws, catches, and skips —
// the victim never acts there. That divergence is engine territory, filed
// as an out-of-arm finding; the sim follows the node engine.)
function driveHostileTurn(Game) {
  const f = Game.tbfight;
  if (!f || f.over) return;
  let cur = null;
  try { cur = Game.tbFighter(f.order[f.turnIdx]); } catch (e) {}
  if (cur && cur.kind === 'hostile' && cur.alive && !cur.fled) {
    try { Game.tbHostileTurn(cur); } catch (e) {}
  }
  try { if (Game.tbEndCheck()) return; } catch (e) {}
  advanceTurn(Game);
}

function withLedgerDark(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      try { ledgerDarkDaily(Game, ctx); } catch (e) { ctx.ldError = (ctx.ldError | 0) + 1; }
      return base.daily(Game, ctx);
    },
    fight(Game, ctx) {
      // Own the betrayal combat's turns.
      // PLAYER TURNS: strike the hostile, closing distance first (the
      // murder-spree pattern — fought to win, no pulled punches; the fight's
      // honest outcome writes the ledger).
      // HOSTILE TURNS: drive the victim's real turn via driveHostileTurn
      // (the engine's tbHostileTurn AI — beg / yield / freeze / flee /
      // desperate fight). The harness never drives a non-player opening
      // turn; without this, a hostile-first turn order freezes the day
      // clock (the day-28 smoke stall). Return false for everything else
      // so the base driver handles it.
      try {
        const LD = ctx && ctx._ledgerdark;
        const f = Game.tbfight;
        if (LD && LD.betrayalFight && f && !f.over) {
          const hostile = (f.fighters || []).find(x => x && x.kind === 'hostile' && x.alive && !x.fled);
          const playerTurn = Game.tbIsPlayerTurn && Game.tbIsPlayerTurn();
          if (hostile && playerTurn) {
            const p = Game.tbFighter('p');
            if (p && !p.acted) {
              const w = Game.equippedWeapon ? Game.equippedWeapon() : null;
              const range = (w && w.range) || 1;
              let d = 99;
              try { d = Game.fighterDistTo(hostile, p.mx, p.my); } catch (e) {}
              try {
                if (d <= range) {
                  Game.tbPlayerStrike(hostile.key);
                } else {
                  const tx = hostile.mx + Math.sign(p.mx - hostile.mx);
                  const ty = hostile.my + Math.sign(p.my - hostile.my);
                  Game.tbPlayerMove(tx, ty);
                }
              } catch (e) {
                // Safety net: if the strike/move's internal turn advance
                // ever throws mid-fight, move to the next live turn rather
                // than freezing. The damage or move already landed.
                advanceTurn(Game);
              }
              return true;
            }
          }
          if (!playerTurn) {
            let cur = null;
            try { cur = Game.tbFighter(f.order[f.turnIdx]); } catch (e) {}
            if (cur && cur.kind === 'hostile' && cur.alive && !cur.fled) {
              driveHostileTurn(Game);
              return true;
            }
          }
        }
      } catch (e) {}
      const bf = base.fight;
      return bf ? bf.call(base, Game, ctx) : false;
    },
  });
}

module.exports = { layerOn, withLedgerDark, ledgerDarkDaily, ledgerVector, ensureLD, recruitCandidate, advanceTurn, driveHostileTurn };
