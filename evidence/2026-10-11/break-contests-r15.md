# Break-it: contests — round 15 (2026-10-11)

Target: the contests system (`src/js/contests.js`, show/fan-club paths). Canon read first:
`docs/CANON.md`, `docs/CONTESTS.md` ("Contests are PLAYED, not RNG"; "If player
isn't involved, put on a watchable show, especially with villagers"; "Winners
come home changed (prizes, trauma, fans). Losers who live come home with
stories... Corpses, funerals, gossip."). Prior rounds: r11 (cheer-trap, dead
`_cxWin`/`_cxLose`, arena-death hygiene, genRoster dead-leak), r12
(held-counter terminals, eligibility panel off-the-board, co-winner share),
r13 (ratings-dip dead signal, `_cxChance`, dead broadcastWatching,
arena-fled comment), r14 (resolve-time eligibility, prize idempotency,
countdown skips, pool reachability, beat census).
Proof: `scripts/test-break-contests-r15-20261011.js` — 55 checks × 3 seeds
(424242 / 777 / 31337), all green (BEFORE: the three kills fail as documented).
r12 + 20261009-r3 suites re-run green (no regressions).

## Kills (3)

### K1 — BET PAYOUT LIE AT THE KCAL CAP (HONESTY)
**Attack:** the ontology claims "bets are real kcal (2x payout on the first
taken)". `_contestVerdict` clamps the payout to `kcalCap()` (deliberate,
break-it food r3) but the copy always said "Your bet pays out: +400 kcal".
**Break:** at the cap, the bet drops you to cap−200 and the win clamps back
to cap — the real gain is +200, but the game announced +400 (double the real
gain). Near the cap (cap−100): gained 300, told +400. Proved with a faithful
model of the pre-fix branch and the real verdict path.
**Fix:** the payout line now says the REAL gain (`kcalBefore`/`after`
measured around the clamp); the fully-capped edge says the body is full
instead of a phantom +400. Cap untouched — the copy was the lie, not the
engine. Ontology rule `bet_payout_honest` added.
**Proof:** K1a pins the old rule (gained 200/300, claimed +400); K1b at cap
now says "+200 kcal" honestly; K1c partial-cap says "+300"; K1d below cap
still nets +200 with a true +400 line; K1e lost bets still deduct and say
so; K1f once-per-contest holds (guard `!ac.bet` + linear phases, no back
path; save/load mid-watch can't dup — `ac.bet` persists, already deducted).

### K2 — AFTERMATH TRAUMA MISSING ON WIN/LOSE (CANON)
**Attack:** canon says "Winners come home changed (prizes, trauma, fans)".
**Break:** the player win/lose end paths in `_contestEnd` applied ZERO
aftermath trauma — trauma only existed per-beat. A merciful duel win
("Accept their yield", no trauma in its `do`) landed with 0 trauma while
REFUSING the contest landed +5: refusing was more traumatic than winning a
blood contest. (13/54 WIN terminals and 20/43 LOSE terminals carry any
trauma in their `do`.)
**Fix:** win +4 trauma, lose +6, both said out loud next to the existing
−5hp winner's mark. Scale mirrors the existing economy (refuse +5,
watched-death +12, multi-take death +8). Watch paths untouched — the
watcher's trauma comes from death/mourning, not from watching a win.
[needs-eyes] — trauma is a feel change; Steve should feel it on his phone.
Ontology rule `aftermath_trauma` added.
**Proof:** K2a pins the old rule (0/0); K2b win → +4 with the line said;
K2c lose → +6 with the line said; K2d watched villager win → player trauma
unchanged.

### K3 — SHOW/DEATH END-PATH RE-ENTRY DOUBLE-GRANTS (IDEMPOTENCY, sibling of r14 K2)
**Attack:** r14 guarded `_contestEnd` (`_prizeGranted`) and
`_contestResolveOthers` (`_othersResolved`). The sibling terminals had no
guard: `_showEnd` (wacky-gift prize, favor, notability), `_showVillagerEnd`
(favor, notability, gossip, leadShift, XP), `_contestDie` (+12 trauma,
blood-on-air crisis, fracture, gossip).
**Break:** a re-entrant call on one ac re-granted everything — proved:
`_showEnd` re-entry moved favor 0→2→4 and inventory 7→8→9 on one ac;
`_showVillagerEnd` re-fired favor; `_contestDie` re-fired the +12 trauma.
Not reachable through the phase engine today (`phase==='done'` blocks
`contestChoose`, and casting splices unique participants), but the same bug
class as r14 K2 — guarded before a future multi-take-show loop can hit it.
**Fix:** `ac._showEnded`, `ac._showVillagerEnded`, and per-participant
`ac._dieLanded` (the verdict loop calls per contestant, so the death key is
per participant — a second contestant's legitimate death still lands).
Ontology rules `show_end_idempotent`, `contest_die_idempotent` added.
**Proof:** K3a pins the old `_showEnd` double-grant; K3b/K3c re-entry is a
no-op post-fix; K3d `_contestDie` re-entry no-ops while a second
contestant's death still lands.

## Held (attacked, system held — documented, not fixed)

- **Watch path honesty:** a not-cast contest renders a real watchable show
  (3 contest-specific beats via `_contestWatchBeat`, cheer/study/bet/comfort
  choices, VERDICT). Not a dead/silent path.
- **Verdicts are PLAYED, not RNG:** `_contestVerdict` resolves through
  `contestResolveGroup` — blood fights fought (`fieldFight`/`duelFight`,
  sealed arena, noFlee), moots argued (case score), chance deterministic
  (stat read, no hidden rolls). No outcome tables.
- **Cheer is real performance, cap +15% real:** `ac.cheer` capped at 0.15 in
  code; `cheerBonus` (≤15) arrives as `braveryBonus` in fights (morale-break
  threshold moves, bounded) and `cheerLift` (≤3) on the moot case score;
  "cameras notice" is real (notability 'showmanship' on cheer choices); the
  narration honestly reflects it (heard-you line on wins, held-the-line
  line on deaths — and silence when they lose uncheered... note: no line
  when cheer>0 and they simply lose; acceptable, not a lie).
- **Study teaches** (`contestLearn`), **comfort lands** (progressive trust
  for the living, +5 trauma + mourning line for the dead).
- **broadcastStart/broadcastEnd idempotent:** double-fire updates meta /
  safe no-op, never double-fires the entry card, never strands the frame.
- **Once-per-contest bet:** `!ac.bet` guard + linear phases (no back button);
  no bet-after-outcome (bet is phase 1, VERDICT is the end); lost bets
  deduct honestly; 2x math real below the cap.
- **Fan favor bounded:** ±100 clamp per lane — not farmable. Care packages
  rate-limited (1/4 days, favor ≥ 20) — no double-grant angle.
- **Mid-sequence save/load:** mid-watch and mid-phase saves JSON-round-trip
  (phases are pure data, no functions) and resolve cleanly after load —
  verdict runs, `activeContest=null`, no phantom. Mid-arena was already
  hardened (persistence r9). Double-load of a done contest: `phase==='done'`
  + nulled `activeContest` — nothing to re-enter.
- **Contest-death corpse gap (documented, NOT fixed — Steve's call):**
  contest deaths remove the roster, seed gossip, fire the blood-on-air
  crisis, and hit the player with trauma (+12 watched, +8 multi-take) — but
  register NO corpse, so no funeral is possible and the dead villager's gear
  evaporates silently. Fixing this invents fiction: the body is in the arena
  ("Dinner is served", "the beast eats") — registering a lootable corpse at
  Haven would fabricate a body. The player-facing lines ("The village will
  say the name for a long time") stay honest. Flagging for Steve rather than
  inventing: memorial-only corpse? System "collects" the gear (said aloud)?

## Sibling sweep
- K1 class (clamped kcal grants claiming the unclamped number): swept
  contest-phase `d.kcal` grants — the `log.push('+N kcal')` line is
  internal-only (app.js renders only phase text + buttons, never the log);
  player-facing cost copy lives in choice subs. Clean. Winner's share goes
  through `pantryAdd` with the honest full-pantry line (r12). Clean.
- K3 class (terminal re-entry): `_contestEnd` (r14), `_contestResolveOthers`
  (r14), `_showEnd`, `_showVillagerEnd`, `_contestDie` (this round) all
  guarded. `_contestRefuse` (+5 trauma, notability, learn) remains
  phase-engine-only — same latent status as the pre-fix K3s; not guarded
  this round (no grant, single terminal, no multi-take loop restores it).
- K2 class (end-path trauma): `_contestRefuse` +5 ✓, `_contestDie` watch
  +12 ✓, `_contestResolveOthers` death +8 ✓, comfort-mourning +5 ✓. Show
  end paths deliberately excluded — TV doesn't kill, lower stakes by canon.
