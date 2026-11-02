#!/usr/bin/env node
// Proof test for the OUTING-ATTEMPT build (gap-closing round):
// a waiting partner's committed forage_help / water_haul favor must
// actually attempt the trip at dawn — depart when both are at Haven —
// or leave a legible in-world reason it cannot (partner away, partner
// not at Haven, player not at Haven, no known creek, ...), never a
// silent rot. Before the build: 0 dawn attempts, favors break with no
// outing note. After: departures on meet dawns, notes on blocked dawns,
// and a completed trip keeps the promise.
// Usage: CASE=<forage-kept|forage-absent|forage-playeraway|water-kept|water-nocreek>
//        SEED=<seed> node scripts/test-outing-attempt.js
// One seed per process (clean harness state per seed).
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const CASE = process.env.CASE || 'forage-kept';
const SEED = parseInt(process.env.SEED || '381', 10);
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
const dayOf = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const homeOf = (G) => { const v = G.state.village || {}; return { x: v.px ?? 4, y: v.py ?? 4 }; };
const nameOf = (G, id) => { try { return G.displayName ? G.displayName(id) : id; } catch (e) { return String(id); } };
const living = (G) => { try { return ((G.state.village || {}).roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return true; } }); } catch (e) { return []; } };

function snap(G, vid) {
  const v = G.state.village || {}, f = (v.favorLedger || {})[vid] || null, p = (v.promises || {})[vid] || null;
  const node = (v.nodePos || {})[vid] || {};
  let waiting = false;
  try { waiting = f && f.kind === 'forage_help' ? !!G.forageFavorWaiting(vid) : f && f.kind === 'water_haul' ? !!G.waterFavorWaiting(vid) : false; } catch (e) {}
  return { day: dayOf(G), dayPart: G.dayPart, bearer: G.villagerId, playerMap: { x: G.map.px, y: G.map.py }, favorState: f ? f.state : null,
    runStarted: !!(f && (f.forageRun || f.waterRun)), runReturned: !!(f && ((f.forageRun && f.forageRun.returned) || (f.waterRun && f.waterRun.returned))),
    deliveredKcal: f && f.forageRun ? (f.forageRun.deliveredKcal || 0) : 0,
    deliveredLiters: f && f.waterRun ? (f.waterRun.deliveredLiters || 0) : 0,
    promiseKept: p ? p.kept : null, attempts: f ? (f.outingAttempts || []) : [],
    waiting, playerAtHaven: (() => { try { return !!G.playerAtHaven(); } catch (e) { return null; } })(),
    nodeNx: node.nx ?? null, nodeNy: node.ny ?? null, away: !!(v.away || {})[vid] };
}

// Target-aware node step-walk (wedge pattern, trimmed): BFS over steps
// travelTo will take, so a refused step is a real wall, not a bad plan.
function walkToNode(G, tx, ty, maxSteps) {
  const tiles = G.map.tiles || [];
  if (!tiles.length) return false;
  const sx = G.map.px, sy = G.map.py;
  if (sx === tx && sy === ty) return true;
  const key = (x, y) => x + ',' + y;
  const prev = {}; prev[key(sx, sy)] = null;
  const q = [[sx, sy]];
  const stepOk = (x, y, nx, ny) => {
    const dx = nx - x, dy = ny - y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
    if (dx && dy) {
      let t = null; try { t = G.tileAt(nx, ny); } catch (e) {}
      if (!t || !t.revealed) return false;
      for (const [ix, iy] of [[nx, y], [x, ny]]) {
        let b = null; try { b = G.travelBlockage(ix, iy, x, y); } catch (e) {}
        if (b) return false;
      }
    }
    let d = null; try { d = G.travelBlockage(nx, ny, x, y); } catch (e) {}
    return !d;
  };
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9 || key(nx, ny) in prev) continue;
      if (!stepOk(x, y, nx, ny)) continue;
      prev[key(nx, ny)] = [x, y]; q.push([nx, ny]);
    }
  }
  if (!(key(tx, ty) in prev)) return false;
  const path = [];
  let cur = [tx, ty];
  while (cur && !(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
  if (path.length > (maxSteps || 40)) return false;
  for (const [nx, ny] of path) {
    if (G.inCombat && G.inCombat()) return false;
    const bx = G.map.px, by = G.map.py;
    try { G.travelTo(nx, ny); } catch (e) { return false; }
    if (G.map.px === bx && G.map.py === by && !(nx === bx && ny === by)) return false;
  }
  return G.map.px === tx && G.map.py === ty;
}
function walkToCell(G, tx, ty, maxSteps) {
  const s = G.state.scholar || {};
  if ((s.mx ?? 4) === tx && (s.my ?? 4) === ty) return true;
  let detail = null;
  try { detail = G.genDetail(G.map.px, G.map.py); } catch (e) { return false; }
  const key = (x, y) => x + ',' + y;
  const prev = {}; prev[key(s.mx ?? 4, s.my ?? 4)] = null;
  const q = [[s.mx ?? 4, s.my ?? 4]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8 || key(nx, ny) in prev) continue;
      try { if (G.cellProps(detail[ny][nx]).blocks) continue; } catch (e) { continue; }
      prev[key(nx, ny)] = [x, y]; q.push([nx, ny]);
    }
  }
  if (!(key(tx, ty) in prev)) return false;
  const path = [];
  let cur = [tx, ty];
  while (cur && !(cur[0] === (s.mx ?? 4) && cur[1] === (s.my ?? 4))) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
  if (path.length > (maxSteps || 20)) return false;
  for (const [nx, ny] of path) {
    if (G.inCombat && G.inCombat()) return false;
    let ok = false;
    try { ok = G.microMove(nx, ny); } catch (e) { return false; }
    if (!ok) return false;
  }
  return (G.state.scholar.mx ?? 4) === tx && (G.state.scholar.my ?? 4) === ty;
}

// Drive days the probe way (waits + sleep); returns after targetDay dawn.
// play='quiet': waits + sleep + fight/contest resolution only — no
// policy upkeep/daily, so no conversation, double-day advance, or
// succession churn touches the committed favor between commit and
// meet dawn. The pre-commit PREDAYS drive still plays (survival).
function driveToDay(G, policy, ctx, targetDay, play) {
  const full = play !== 'quiet';
  let guard = 0;
  while (dayOf(G) < targetDay && !G.over && guard++ < 60) {
    for (let p = 0; p < 3; p++) {
      if (full && policy.upkeep) { try { policy.upkeep(G, ctx); } catch (e) {} }
      try { driveFights(G, policy, ctx); } catch (e) {}
      try { driveContests(G, policy, ctx); } catch (e) {}
      if (G.over) break;
      try { G.doAction('wait'); } catch (e) {}
      try { driveFights(G, policy, ctx); } catch (e) {}
      try { driveContests(G, policy, ctx); } catch (e) {}
      if (G.over) break;
    }
    if (G.over) break;
    if (full && policy.daily) { try { policy.daily(G, ctx); } catch (e) {} }
    if (!full) { for (let k = 0; k < 3; k++) { try { G.eat(); } catch (e) {} try { G.doAction('drink'); } catch (e) {} } }
    try { G.sleep(); } catch (e) {}
    if (G.over) break;
  }
}

function completeForageTrip(G, vid) {
  const v = G.state.village || {}, f = (v.favorLedger || {})[vid];
  if (!f || !f.forageRun) return 'no-run';
  const home = homeOf(G);
  const F = (globalThis.Scattering || {}).forage;
  const targets = [];
  for (const tt of (() => { try { return G.travelTargets() || []; } catch (e) { return []; } })()) {
    if (tt.x === home.x && tt.y === home.y) continue;
    try { if (G.travelBlockage(tt.x, tt.y)) continue; } catch (e) {}
    const tile = (() => { try { return G.tileAt(tt.x, tt.y); } catch (e) { return null; } })();
    if (!tile) continue;
    let can = true;
    try { can = !F || !F.canForage || F.canForage(tile); } catch (e) { can = true; }
    if (can) targets.push(tt);
  }
  let pressed = false;
  if (process.env.DEBUG) console.log('DEBUG forage targets=' + JSON.stringify(targets) + ' home=' + JSON.stringify(home));
  for (let ni = 0; ni < targets.length && ni < 3 && !pressed; ni++) {
    const target = targets[ni];
    try { G.travelTo(target.x, target.y); } catch (e) {}
    if (G.map.px !== target.x || G.map.py !== target.y) { if (!walkToNode(G, target.x, target.y, 16)) { if (process.env.DEBUG) console.log('DEBUG target unreachable ' + JSON.stringify(target)); continue; } }
    const vpos = (G.state.village.positions || {})[vid] || null;
    if (process.env.DEBUG) console.log('DEBUG target ' + JSON.stringify(target) + ' vpos=' + JSON.stringify(vpos) + ' playerMicro=' + (G.state.scholar.mx ?? 4) + ',' + (G.state.scholar.my ?? 4));
    if (!vpos) continue;
    let detail = null;
    try { detail = G.genDetail(G.map.px, G.map.py); } catch (e) {}
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = vpos.mx + dx, cy = vpos.my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      try { if (detail && G.cellProps(detail[cy][cx]).blocks) continue; } catch (e) {}
      cells.push({ mx: cx, my: cy });
    }
    for (const cell of cells) {
      if (G.inCombat && G.inCombat()) return 'combat';
      if (!walkToCell(G, cell.mx, cell.my, 20)) { if (process.env.DEBUG) console.log('DEBUG cell unwalkable ' + JSON.stringify(cell)); continue; }
      const st = (() => { try { return G.forageFavorAction(vid, f); } catch (e) { return { ready: false }; } })();
      if (process.env.DEBUG) console.log('DEBUG cell ' + JSON.stringify(cell) + ' status=' + JSON.stringify(st));
      if (!st.ready || st.action !== 'forage_together') continue;
      const haulKcal = (xs) => (xs || []).reduce((n, i) => n + (Number(i.kcalEach) || 0) * (Number(i.units) || 0), 0);
      const before = haulKcal(f.forageRun.playerHaul) + haulKcal(f.forageRun.partnerHaul);
      let res = null;
      try { res = G.convoPerformFavor(vid, f); } catch (e) { res = { ok: false }; }
      const after = haulKcal(f.forageRun.playerHaul) + haulKcal(f.forageRun.partnerHaul);
      if (res && res.ok && after > before) { pressed = true; break; }
    }
  }
  if (!pressed) return 'no-press';
  if (G.map.px !== home.x || G.map.py !== home.y) {
    try { G.travelTo(home.x, home.y); } catch (e) {}
    if (G.map.px !== home.x || G.map.py !== home.y) { if (!walkToNode(G, home.x, home.y, 40)) return 'no-home'; }
  }
  const st = (() => { try { return G.forageFavorAction(vid, f); } catch (e) { return { ready: false }; } })();
  if (!st.ready || st.action !== 'forage_deliver') return 'deliver-blocked:' + (st.reason || '');
  let res = null;
  try { res = G.convoPerformFavor(vid, f); } catch (e) { res = { ok: false }; }
  return (res && res.ok) ? 'delivered' : 'deliver-failed';
}

function completeWaterTrip(G, vid) {
  const v = G.state.village || {}, f = (v.favorLedger || {})[vid];
  if (!f || !f.waterRun) return 'no-run';
  const home = homeOf(G);
  const target = f.waterRun.target;
  if (!target) return 'no-target';
  try { G.travelTo(target.x, target.y); } catch (e) {}
  if (G.map.px !== target.x || G.map.py !== target.y) { if (!walkToNode(G, target.x, target.y, 16)) return 'no-creek'; }
  let res = null;
  try { res = G.convoPerformFavor(vid, f); } catch (e) { res = { ok: false }; }
  if (!res || !res.ok) return 'collect-failed:' + (res && res.line);
  if (G.map.px !== home.x || G.map.py !== home.y) {
    try { G.travelTo(home.x, home.y); } catch (e) {}
    if (G.map.px !== home.x || G.map.py !== home.y) { if (!walkToNode(G, home.x, home.y, 40)) return 'no-home'; }
  }
  const st = (() => { try { return G.waterFavorAction(vid, f); } catch (e) { return { ready: false }; } })();
  if (!st.ready || st.action !== 'water_deliver') return 'deliver-blocked:' + (st.reason || '');
  try { res = G.convoPerformFavor(vid, f); } catch (e) { res = { ok: false }; }
  return (res && res.ok) ? 'delivered' : 'deliver-failed';
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'mvc', fullTelemetry: true, narration: true });
  await setupGame(Game);
  // The harness swallows module load failures (loadFails unasserted):
  // fail loudly here if the outing module never attached.
  check('outing module loaded', typeof Game.attemptWaitingOutings === 'function', JSON.stringify(loadFails || []));
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) {} }
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function () { try { said.push(Array.prototype.slice.call(arguments).join(' ')); } catch (e) {} return _say.apply(this, arguments); };

  const kind = CASE.startsWith('water') ? 'water_haul' : 'forage_help';
  // PREDAYS: drive this many days before committing, so the world is old
  // enough to have forageable patches (day-1/2 ground near Haven is
  // often barren — the wedge's own funnel shows forages landing from
  // day 8 on). The commit/meet/due geometry is unchanged.
  const PREDAYS = parseInt(process.env.PREDAYS || '0', 10);
  if (PREDAYS > 0) driveToDay(Game, policy, ctx, dayOf(Game) + PREDAYS);
  const day = dayOf(Game);
  const home = homeOf(Game);
  const cands = living(Game).filter(id => String(id) !== String(Game.villagerId));
  if (cands.length < 1) { console.log('FAIL setup: no living villagers'); process.exit(1); }
  const vid = cands[0];
  const v = Game.state.village || {};
  // Player home: travel home if needed (setup usually starts there).
  if (Game.map.px !== home.x || Game.map.py !== home.y) {
    try { Game.travelTo(home.x, home.y); } catch (e) {}
    if (Game.map.px !== home.x || Game.map.py !== home.y) walkToNode(Game, home.x, home.y, 40);
  }
  // Partner home at commit; away state cleared so commit is legal.
  try { Game.npcSetNode(vid, home.x, home.y); } catch (e) {}
  if (v.away) delete v.away[vid];
  // Water-kept needs a known creek; mark the nearest creek tile seen
  // (mirrors a player who has already found a creek).
  let creekKnown = false;
  if (kind === 'water_haul' && CASE === 'water-kept') {
    const tiles = Game.map.tiles || [];
    let best = null;
    for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
      if (tiles[y][x] && tiles[y][x].type === 'creek') {
        const d = Math.abs(x - home.x) + Math.abs(y - home.y);
        if (!best || d < best.d) best = { x, y, d };
      }
    }
    if (best) { try { Game.markSeen(best.x, best.y, 'visited'); creekKnown = true; } catch (e) {} }
  }
  if (kind === 'water_haul' && CASE === 'water-nocreek') {
    // Observe only: if a creek is already seen, this case cannot prove
    // the no-creek note; the run reports it instead of failing spuriously.
    const tiles = Game.map.tiles || [];
    for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
      if (tiles[y][x] && tiles[y][x].type === 'creek') { try { if (Game.mapSeen(x, y)) creekKnown = true; } catch (e) {} }
    }
  }
  const f = { id: 'test-outing-' + kind + '-' + String(vid), vid, kind, goal: kind === 'forage_help' ? 'feed' : 'prove', task: 'test ' + kind,
    state: 'asked', askedDay: day, deadline: day + 2, line: '"test"',
    short: kind === 'forage_help' ? 'the pantry run' : 'the creek water run' };
  Game.convoStoreFavor(f);
  const r = Game.convoFavorCommit(vid, f);
  check('commit ok', !!(r && r.ok), JSON.stringify(r));
  const commitDay = dayOf(Game), meetDay = f.meetDay, dueDay = Game.promiseDueDay((Game.state.village.promises || {})[vid]);
  console.log('INFO commitDay=' + commitDay + ' meetDay=' + meetDay + ' dueDay=' + dueDay + ' partner=' + nameOf(Game, vid) + ' creekKnown=' + creekKnown);
  check('meetDay = commitDay+1', meetDay === commitDay + 1, 'meetDay=' + meetDay);
  check('dueDay = meetDay+1', dueDay === meetDay + 1, 'dueDay=' + dueDay);

  {
    // Door alignment: the departure needs both on the same side of the
    // Haven door, and the hook never drags anyone through it. Sleep on
    // the partner's side, as a player bedding down in the hall would.
    try {
      const v0 = Game.state.village || {}, s0 = Game.state.scholar || {};
      const partnerInside = (v0.npcInside || {})[vid] !== false;
      const playerInside = s0.insideHaven !== false;
      if (partnerInside !== playerInside) {
        if (playerInside) { try { Game.exitBuilding(); } catch (e) {} }
        else { try { Game.enterBuilding(); } catch (e) {} }
      }
    } catch (e) {}
  }
  if (CASE === 'forage-absent') {
    // Partner leaves after committing: the meet dawn must name the road.
    const vv = Game.state.village || {};
    vv.away = vv.away || {};
    vv.away[vid] = { nx: home.x + 1, ny: home.y, purpose: 'expedition', sinceDay: dayOf(Game), sincePart: 0, duration: 99 };
  }
  if (CASE === 'forage-playeraway') {
    // Player walks one node away before the meet dawn. Verify the move
    // stuck: a refused travel would silently test the wrong state.
    const tts = (() => { try { return Game.travelTargets() || []; } catch (e) { return []; } })();
    for (const away of tts) {
      if (away.x === home.x && away.y === home.y) continue;
      try { Game.travelTo(away.x, away.y); } catch (e) {}
      if (Game.map.px !== away.x || Game.map.py !== away.y) walkToNode(Game, away.x, away.y, 16);
      if (Game.map.px !== home.x || Game.map.py !== home.y) break;
    }
    // Exact node check: playerAtHaven() is true within 1 node of home,
    // but the outing departure needs the player ON the Haven node itself.
    if (Game.map.px === home.x && Game.map.py === home.y) { console.log('SETUP-FAIL player still on Haven node after away move'); process.exit(2); }
    // Sleep rough where we stand: the meet dawn still fires via endDay.
  }

  if (CASE === 'water-nocreek-direct') {
    // Deterministic branch test: call the dawn attempt directly in a
    // constructed dawn state (same side of the door, partner home,
    // no creek known) and assert the creek note. No driving, no RNG.
    const vv = Game.state.village || {}, ss = Game.state.scholar || {};
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = true; ss.insideHaven = true;
    ss.day = meetDay; Game.dayPart = 0;
    const res = Game.attemptWaitingOuting(vid, f);
    console.log('INFO direct ' + JSON.stringify(res) + ' attempts=' + JSON.stringify(f.outingAttempts || []));
    check('direct attempt notes (not departs)', res && res.outcome === 'noted', JSON.stringify(res));
    check('direct note names the creek', /creek/i.test(String(res && res.reason)), JSON.stringify(res));
    check('direct note stamped on favor', (f.outingAttempts || []).some(a => a.outcome === 'noted' && /creek/i.test(String(a.reason))), JSON.stringify(f.outingAttempts));
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
  driveToDay(Game, policy, ctx, meetDay, 'quiet');
  const atMeet = snap(Game, vid);
  console.log('INFO meet-dawn ' + JSON.stringify(atMeet));
  if (CASE === 'forage-kept' || CASE === 'water-kept') {
    // The window is TWO dawns: a door-side flip on the meet dawn is a
    // legible note, not a failure — the due dawn retries. Only fail if
    // neither dawn departs.
    let departedSnap = atMeet.runStarted ? atMeet : null;
    if (!departedSnap) {
      driveToDay(Game, policy, ctx, dueDay, 'quiet');
      const atDue = snap(Game, vid);
      console.log('INFO due-dawn ' + JSON.stringify(atDue));
      if (atDue.runStarted) departedSnap = atDue;
    }
    check('dawn departure in window', !!departedSnap, JSON.stringify(atMeet));
    if (departedSnap) {
      const done = kind === 'forage_help' ? completeForageTrip(Game, vid) : completeWaterTrip(Game, vid);
      console.log('INFO completion ' + done);
      const after = snap(Game, vid);
      console.log('INFO after-completion ' + JSON.stringify(after));
      check('trip completes', done === 'delivered', done);
      check('promise kept', after.promiseKept === true, JSON.stringify(after));
      check('favor fulfilled', after.favorState === 'fulfilled', JSON.stringify(after));
    } else {
      check('trip completes', false, 'no departure to complete');
      check('promise kept', false, 'no departure to complete');
      check('favor fulfilled', false, 'no departure to complete');
    }
  }
  if (CASE === 'forage-absent' || CASE === 'forage-playeraway' || CASE === 'water-nocreek') {
    // If the meet dawn noted only the door, step through it: the due
    // dawn then surfaces the deeper blocker (e.g. the missing creek)
    // instead of the door masking it twice.
    if (CASE === 'water-nocreek') {
      const mn = ((Game.state.village.favorLedger || {})[vid] || {}).outingAttempts || [];
      if (mn.length && /door|hall|grounds|same side/i.test(String(mn[mn.length - 1].reason || ''))) {
        try {
          const v0 = Game.state.village || {}, s0 = Game.state.scholar || {};
          const partnerInside = (v0.npcInside || {})[vid] !== false;
          const playerInside = s0.insideHaven !== false;
          if (partnerInside !== playerInside) {
            if (playerInside) { try { Game.exitBuilding(); } catch (e) {} }
            else { try { Game.enterBuilding(); } catch (e) {} }
          }
        } catch (e) {}
      }
    }
    // Drive through the due day's end: the favor may break, but never silently.
    driveToDay(Game, policy, ctx, dueDay + 1, 'quiet');
    const fin = snap(Game, vid);
    console.log('INFO final ' + JSON.stringify(fin));
    const notes = (fin.attempts || []).filter(a => a.outcome === 'noted');
    const dawnLines = said.filter(l => /dawn/i.test(l) && l.indexOf(nameOf(Game, vid).split(' ')[0]) >= 0);
    console.log('INFO dawn-note-lines ' + JSON.stringify(dawnLines.slice(-4)));
    if (CASE === 'water-nocreek' && creekKnown) {
      console.log('INFO water-nocreek N/A: a creek was already known on this seed; departure expected instead');
      check('water departs when creek known', fin.runStarted, JSON.stringify(fin));
    } else {
      check('blocked dawn leaves a legible note', notes.length >= 1, JSON.stringify(fin.attempts));
      if (CASE === 'forage-absent') check('note names the road/absence', /road|away|gone|not at Haven|isn/i.test(notes.map(a => a.reason).join(' ')), JSON.stringify(notes));
      if (CASE === 'water-nocreek') check('note names the creek', /creek/i.test(notes.map(a => a.reason).join(' ')), JSON.stringify(notes));
      if (CASE === 'forage-playeraway') check('note names player absence', /you|weren/i.test(notes.map(a => a.reason).join(' ')), JSON.stringify(notes));
      check('no silent rot (note precedes any break)', fin.favorState !== 'broken' || notes.length >= 1, JSON.stringify(fin));
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
