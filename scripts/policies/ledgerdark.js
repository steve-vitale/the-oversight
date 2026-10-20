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
    for (const id of ((vv.party || []))) {
      if (id === me || !isAlive(id)) continue;
      return id;
    }
  } catch (e) {}
  return null;
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

function withLedgerDark(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      try { ledgerDarkDaily(Game, ctx); } catch (e) { ctx.ldError = (ctx.ldError | 0) + 1; }
      return base.daily(Game, ctx);
    },
    fight(Game, ctx) {
      // Own the betrayal combat's player turns: strike the hostile,
      // closing distance first (the murder-spree pattern — fought to win,
      // no pulled punches; the fight's honest outcome writes the ledger).
      // Return false for everything else so the base driver handles it.
      try {
        const LD = ctx && ctx._ledgerdark;
        const f = Game.tbfight;
        if (LD && LD.betrayalFight && f && !f.over &&
            Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          const hostile = (f.fighters || []).find(x => x && x.kind === 'hostile' && x.alive && !x.fled);
          if (hostile) {
            const p = Game.tbFighter('p');
            if (p && !p.acted) {
              const w = Game.equippedWeapon ? Game.equippedWeapon() : null;
              const range = (w && w.range) || 1;
              let d = 99;
              try { d = Game.fighterDistTo(hostile, p.mx, p.my); } catch (e) {}
              if (d <= range) {
                Game.tbPlayerStrike(hostile.key);
                return true;
              }
              try {
                const tx = hostile.mx + Math.sign(p.mx - hostile.mx);
                const ty = hostile.my + Math.sign(p.my - hostile.my);
                Game.tbPlayerMove(tx, ty);
                return true;
              } catch (e) { return false; }
            }
          }
        }
      } catch (e) {}
      const bf = base.fight;
      return bf ? bf.call(base, Game, ctx) : false;
    },
  });
}

module.exports = { layerOn, withLedgerDark, ledgerDarkDaily, ledgerVector, ensureLD };
