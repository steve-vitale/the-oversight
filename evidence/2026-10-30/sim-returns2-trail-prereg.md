# sim-returns2-trail — PREREGISTRATION (binding, committed BEFORE any judged leg)

Run: gaps coordinator #2, arm gaps2-returns (b).
Assignment: Steve 2026-10-29 15:47 CDT, "Address remaining gaps" — returns
next preregs. Prior build HELD, NOT killed: build-returns trail-follow
pilot NO-GO on a SOLE miss (national-ever 5 < 6) while its primaries
PASSED (arrival-arising DELIBERATE meetings 9 > control 4; empty-tile
rate 0.926 → 0.792; 34 follows / 432 firings, ~18% convert). This prereg
is a FRESH-BAND RE-TEST: it NEVER re-scores the old pilot. Every number
below is judged on FRESH corpora run under this prereg, on the ported
tree. A miss under it is NO-GO, never re-scored mid-run
(MEASUREMENT.md §14). Gating freeze stands: NO deedGateReady,
finale-omen, or wave/scale threshold change anywhere in this arm.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) and docs/PARTY.md,
then the prior evidence: evidence/2026-10-29/prereg-trail-follow.md
(prior prereg, on build-returns — superseded by this prereg for all
future runs, NOT re-scored), the build-returns trail pilot verdict
(trailfollow-pilot-verdict.md, referenced only — its rows are never
read here), and evidence/2026-10-29/sim-arrival-a.md (diagnosis +
design, if present in this tree; otherwise the design as frozen
below, which restates it). CANON GAP (restated, not invented): no
CANON-registered doc covers monster trails, arrival following, or
field-fight returns. The mechanism below is derived from code and
from the arrival diagnosis (91% empty-tile arrivals in returns-a),
verified by reading src/js/game.js and src/js/villager-objectives.js
before this prereg was written. PERCEPTION LAW: the trail is ground
sign history, never a live-position handoff — no code in this arm
hands the hunter the beast's current tile, and no roster/list feed
is consulted anywhere.

## Game change (frozen — and nothing else)

The ported trail-follow mechanism (merge commit e0c6e600a in this
tree, ported mechanisms-only from build-returns tip 137cd5a9a),
in two pieces, frozen together. Neither alone is a landing.

PIECE A — trail store (src/js/game.js: spawnWorldMonster +
wanderWorldMonsters + both in-place mFlee relocations in
villagerMonsterTick and in the player-fight mFlee site):

- Every world monster carries `trail`: an ordered list of world
  tiles it occupied, oldest first, newest last.
- spawnWorldMonster seeds `trail` with the spawn tile:
  `trail = [[tx, ty]]` (including the fled-recovery respawn,
  which is a fresh record on its spawn tile).
- Every successful wanderWorldMonsters step appends the NEW tile;
  every in-place mFlee relocation appends the NEW tile the same
  way — BOTH mFlee sites. Blocked wander attempts (edge / safe
  tile / occupied tile) append nothing.
- Cap 3: appending past 3 drops the oldest entry. No timestamps:
  freshness is trail length, not wall time.
- removeWorldMonster drops the trail with the beast; dead beasts
  leave corpses (existing system), not trails.
- Other relocations do NOT seed or append trails (player-side
  follow re-entry, teleports): later wander steps rebuild the
  trail from the new tile. Deliberate scope pin, not oversight.

PIECE B — follow rule (src/js/villager-objectives.js:
objTrailFollow + objAwayStep arrival block + objPick reset,
and nothing else in that file):

- Helper objTrailFollow(rid, o, hx, hy), called from the arrival
  block ONLY when the quarry is gone (no matching-id beast on the
  tile — including the different-beast-on-tile case). Returns
  { followed, reason, from, to, trail } and, on a follow,
  re-targets the objective itself. Pure decision except for the
  re-target + followsUsed increment on success.
- Follow conditions, ALL required: (1) quarry found by huntMid
  in the world-monster list (first match; species-id granularity,
  same limitation as the existing arrival check — stated, not
  hidden); dead/despawned quarry → reason `no-trail`. (2) The
  hunter's tile is in the quarry's trail; else `aged-out`.
  (3) A next tile exists in the trail after the hunter's tile;
  else `no-next`. (4) Follows used this trip < 2; else `cap`.
  (5) Next tile within the objective's tightness of haven
  (objDist ≤ o.tightness; null tightness = no constraint); else
  `tightness`. (6) Trip clock still runs (o.partsLeft > 0 at
  firing, after that part's decrement); else `clock`. A follow
  NEVER extends partsLeft.
- On a follow: o.tx/o.ty = next, o.followsUsed++, the memory is
  NOT spent, and the follow beat is narrated (haven-player-gated,
  descriptor name only — see prior prereg for exact lines).
  Otherwise: the memory is spent EXACTLY as before
  (objDropMonsterSighting, same args) AND the gone beat is
  narrated (same gating). Today's behavior is the fallback.
- objPick resets o.followsUsed = 0 on every fresh pick.
- Narration beats are spoken ONLY when the player is at haven
  (map.px === hx && map.py === hy), mirroring the departure
  line, naming the beast via monsterDisplayName (descriptor or
  village name, never the true name pre-System).

EXPLICITLY REJECTED — do not build: live nearest-monster lookup
(a radar; perception law forbids it); longer linger without
signal; not spending the memory on empty arrival; global wander
slowdown; any gate, weight, pre-gate, lottery, wander-rate, or
fight-roll change; any party, damage, or kill-side change. The
grudge lottery change stays exactly as it is on both roots in
this run — this arm moves arrivals, not picks.

## Roots, substrate, runner (paired by construction; grudge held constant)

- CONTROL root: the gaps2-returns-control tree, second state:
  parent commit + instruments only + the GRUDGE-ONLY port
  (villager-objectives.js grudge hunks: HUNT push weight +
  objGrudgeHuntWeight; game.js untouched by grudge). Committed
  in the control tree with proof PASS
  (scripts/test-grudge-lottery.js) before the control corpus
  runs. Trail code is ABSENT from this root — verified by
  grep (no objTrailFollow, no noteMonsterTrail, no trail field
  on spawn) before the corpus runs. This is what makes the
  comparison trail-attributable: the ONLY src/js difference
  between control and pilot roots is trail-follow.
- PILOT root: this tree (gaps2-returns) at merge commit
  e0c6e600a plus only prereg + evidence commits (the hunthold
  provenance-clearing commit, if it lands before this corpus,
  is a stated exception — it touches only GUARD/chore
  conversions, never a HUNT objective's trail or follow, and
  its presence or absence is recorded in the evidence header
  either way).
- Substrate (identical in both roots): tableseat-nowait policy
  VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, 180d death-aware, competent policy
  tableseat-nowait. Runner: scripts/test-funnel-a-sweep.js
  verbatim, SEEDS + EVID env overrides only.
- Corpora (fresh, read-only after the run):
  evidence/2026-10-29/perseed-returns2-trailcontrol/ (control
  tree, grudge-only, seeds 75101–75116) and
  evidence/2026-10-29/perseed-returns2-pilot/ (this tree, same
  seeds — SHARED with the grudge arm: same rows, different
  judge, because the pilot code is identical; the trail pilot
  does not re-run what the grudge pilot already ran).
- Recorder: scripts/policies/returns-diag.js follows channel
  (wrap of objTrailFollow, installed ONLY when that function
  exists — conditional wrap, no error when absent, so the
  control leg records zero follows without failing) + needs
  blocks on departures and drops (same pure reads as the
  funnel needs block). The funnel recorder is unchanged.
- Judge: scripts/judge-trail-follow.js VERBATIM (no judge edits
  in this run), --band confirm (seeds 75101–75116).

## Seed-number reuse, stated plainly

Seed numbers 75101–75116 are reused because identical-seed
pairing requires them. The BAND is fresh: both corpora are new
runs on current roots, and the old pilot rows (build-returns
perseed-trailfollow-*) are never read by the judge in this run.
If any step reads an old row, that step is void and the run
restarts on fresh dirs. The prior pilot's sole miss
(national-ever 5 < 6) is NOT re-litigated: national-ever is a
cost bar here too (below), judged only on the fresh band.

## PRIMARY (GO requires ALL; ALL waves)

1. Arrival-arising DELIBERATE meetings on the pilot band EXCEED
   the control band count (identical seeds). "Arrival-arising"
   = a DELIBERATE-class meeting per returns-a (travel intent +
   prior fight memory, both pre-meeting, classified by
   classifyMeeting over the fp+rt join — never inferred from
   outcome), with a recorded arrival or follow for that beast
   within the 10 preceding parts: a `follows` record OR a
   `drops` record with dropped=true, same vid and same mid,
   with 0 <= meeting.part - firing.part <= 10 on the shared
   partCounter scale.
2. At least one such meeting on the pilot band (candidate
   count >= 1).

Wave-4 is DIAGNOSTIC ONLY: wave-4 departures, follows, and
arrival-arising meetings are reported by wave, but no wave-4
threshold decides. (Rationale, recorded before any run: wave-4
departures on 16 seeds may still be ~0–2 while the funnel is
thin, so a wave-4-only primary would be untestable through no
fault of arrival. The prior pilot's wave-4 diagnostic was
untestable on its band for the same reason — departures 1 vs
0, meetings 0 both — and this prereg does not pretend otherwise.)

## COST BARS (GO requires ALL)

- Starvation deaths ≤ control + 2 on band totals.
- Zero need-override behavior attributable to the change: no
  follow record joins to a departure for the same (vid,
  huntMid) — latest departure before the follow — whose
  departure needs show a pre-gate condition (energy < 35, or
  hunger > 55 while pantry > 500). Mid-trip follows cannot
  override a pick-time pre-gate by construction (the trip
  departed only after the gates passed); this join verifies
  it from the recorder's need fields. Any count > 0 fails.
  (The clock invariant — follows never extend partsLeft — is
  proven in the proof test, not re-judged from the corpus.)
- Wall not worse than control on wins and on national-ever
  (band totals).

## DIAGNOSTIC (reported, not deciding)

- Empty-tile arrival rate: distinct true drops / HUNT
  departures (must fall only via follows that meet, never via
  redefinition of a drop — the spend rule is unchanged where
  the follow cannot fire).
- Follow rate (follows taken / arrival-block firings with
  quarry gone) and follow→meeting conversion, by reason
  where not followed (no-trail / aged-out / no-next / cap /
  tightness / clock).
- Arrival→meeting conversion by wave; wave-4 slice
  (departures, follows, arrival-arising meetings, conversions).
- Linger proxy: dropped=false drop records per true drop.
- Need state at departure vs at drop (hunger/energy deltas).
- Recorder hygiene: errs 0 + overflow empty in every row,
  both corpora; follows channel present in pilot rows, absent
  (not errored) in control rows. A hygiene failure voids the
  corpus (INSUFFICIENT-DATA with failing rows named).

## Proof tests (before the pilot corpus is judged; both must pass)

1. scripts/test-trail-follow.js — trail-store fixture + arrival
   fixture (spawn seed, wander append + cap, mFlee append, dead
   drops trail; follow re-target + no spend + followsUsed 1;
   no-trail / aged-out / present / diff-beast / cap / clock /
   tightness / pick-reset / narration gating). Already PASS on
   the ported tree (run at merge time); re-run verbatim before
   judging and record the result in the evidence header.
2. node scripts/check.js --quick with
   --cacheDirectory=/tmp/jest-cache-gaps2-returns, adjudicated
   against the merge-commit baseline: ZERO NEW failures vs
   that baseline (same names, same inner counts). Any new
   failure fails the proof and blocks judging.

## Verdict and landing rule

- GO (both primaries + all cost bars pass) means: the
  trail-follow hunks, and only those hunks, are a LANDING
  CANDIDATE recommended to the coordinator. This arm does NOT
  land anything: no push, no bump, no live verification, no
  merge to master.
- NO-GO (any primary or cost bar fails) means: the mechanism
  stays held. Per MEASUREMENT.md §14a, the evidence classifies
  the kill from the mechanism section. In particular: if the
  pilot moves follows clearly but meetings stay 0, the verdict
  is still NO-GO on the primary, and the correct next step is
  the adjacent-hearing fallback (sim-arrival-a Diag 6, rank 2)
  or the lottery arm landing first — not a bigger trail cap
  and not a longer linger.
- INSUFFICIENT-DATA (hygiene voids a corpus, or the pilot band
  produces zero arrival-block firings with quarry gone in
  either corpus — i.e. the follow rule was never exercised)
  means: no verdict on the mechanism; the next run needs a
  band where arrivals actually happen.
