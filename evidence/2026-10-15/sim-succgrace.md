# sim-succgrace — succession-day grace for sub-bar links (2026-10-15)

Worktree: `~/workspace/worktrees/sim-succgrace`. Run: oversight-flesh-out-loop
fleshout-a-20261015T0715Z, ARM 1 (sim-succgrace) — GAME-CODE LEVER,
SUCCGRACE=1 env-gated, default OFF. Claims sim-findings #321.

**Assignment lineage:** sim-succhain (evidence/2026-10-15/sim-succhain.md)
chained every bearer <redacted> young nationals (23 chains, 23/23 attributed):
the cascade is combat-mortality, NOT polity-dissolution — 22/23 chains keep
rank 7d after the last death (succession-collapse closed as a loss mode by
the landed succpolity window). The ONE rank-fall (leadfeast s44 d115)
dissolved the realm aloud on a leader death where village_2's link sat at
trust 44 pre-death, took the funeral's −8 haircut to 36 (< the 40 seasoned
bar), and the realm — exactly 3 seasoned fires with village_2 the third —
came apart with NO recourse. (The sim-succhain narrative's "pre-death 36"
is the instrument's death-day row, post-haircut; the -full.json scaleRows
show d114: 44 → d115: 36 → d116: regional.) The 14d proving window reads
inherited standing for polity-membership bars; a link below the bar at the
funeral dissolves with no recourse.

**Canon:** docs/CANON.md read first; docs/SCALE.md read for the scale
ladder/polity definition (national = live state; LEAD = one primary with
≥3 seasoned subordinates; seasoned = 30+ days AND trust 40+). No tribute or
succession canon doc exists — the staged-renegotiation idiom extended here
is `young_links_get_grace` (src/js/hierarchy.js), not canon.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** on successions where a Haven-primary link sits below the
seasoned trust bar (trust < 40) at the funeral and the realm would dissolve
aloud, does staging an answerable renegotiation beat (gift/visit/wait, real
costs, 7d expiry — the young-link idiom) give the new bearer a played
chance to hold the fraying link, without changing any default-off
trajectory?

**Lever:** SUCCGRACE=1 (src/js/hierarchy.js, env-gated, default OFF). In
`successionCrisis`, after the untouched chaos (haircut, mourning, tribute
move, neglect snap), for a Haven-primary link (link.primary === 'haven'),
seasoned-age (30+d), below the seasoned bar per the polity read, where the
realm is currently failing (`state.nationalLive && !_havenPolity()`):
stage `link.pendingRenegotiation = {day, sub:false, succgrace:true}` with
an aloud beat. While pending, `_linkSeasoned` counts the link (the verdict
is delayed). `answerRenegotiation` resolves normally; the beat's answers
are the new speaker's played deeds and land through the mourning choke
(like the young-link idiom, which never marks mourning so its answers
land) — mourning itself is untouched (ordinary gains stay gagged,
mourningUntil restored). Unanswered, `_renegotiationTick` lapses it at 7d
(trust −6) and the realm dissolves aloud exactly as today.

HARD BOUNDARIES (not moved): the old-link ×1.5 tribute leverage numbers
(sim-findings #323 is steve-call — untouched); the 14d proving window
(untouched); chaos haircut/mourning/tribute/neglect-snap (untouched —
the haircut lands, mourning still gags ordinary gains, tribute still
moves, the snap still runs).

**PRIMARY (intermediate — the aloud dissolution is too rare for a count
primary; follows the sim-tribshield §14 precedent):**
- staged beats fired on eligible sub-bar-link successions = 100% of
  eligible (counted from the proof fixture + sweep ctx), AND
- ZERO aloud dissolutions of eligible links without the beat being staged
  and resolved first (answered or lapsed).
GO → land as its own gated commit. Miss → KILL per protocol (src/js
reverted byte-clean; scripts + evidence retained).

**GUARDRAILS (binding):** median survival armed ≥ control − 10d; national
formations armed ≥ control − 2/16; no new death mode at n ≥ 3.

**SECONDARIES (report-only):** hold-days sum ratio, dissolution counts,
wave reach (4/5), table/wins, per-seed wall numbers.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast,
belongfeast} × {control: unlayered, armed: SUCCGRACE=1}, 180d death-aware
horizons, own control in the SAME sweep (never inherited).
FEASTSCALE_R13=1 asserted up front in proof AND sweep (the #312 lesson).
SMOKE=1 instrument-honesty gate (fail loudly if the suite ever runs
policy-less). The base courtship policies never answer renegotiation
beats — in the sweep, staged beats lapse at 7d and dissolution proceeds
as today; the answered→held path is proven in the proof fixture.

**Horizon + why:** 180d death-aware (dead villages stop simulating, ≤10d
tail). The eligible event needs a national realm (first sits ~day 61–90
per SCALE.md pacing) plus a leader death on a sub-bar link — rare; the
full 180d is the only honest window. Death-aware, never fixed truncation.

**Proof:** `scripts/test-succgrace-20261015.js` — REAL RED (mechanism
demonstrably absent with the gate off on a constructed sub-bar
succession: no beat staged, realm dissolves aloud as today) → GREEN
(beat staged on the fixture; answered 'gift' → trust 44 ≥ 40, realm
holds; answered 'visit' → 41 ≥ 40, holds; unanswered → 7d lapse →
dissolves exactly as today; expiry at 7d); det-gate (gate-off
trajectories byte-identical to pristine HEAD hierarchy.js via an
override loader; armed determinism ×2).

**Metric review (§14):** required — see end of file.

## Results — the 32-run sweep

Substrate: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
{control, SUCCGRACE=1}, 180d death-aware, own control in-sweep,
FEASTSCALE_R13=1 asserted up front. Runs:
`evidence/2026-10-15/sim-succgrace-runs.json`; sweep log:
`evidence/2026-10-15/succgrace-sweep.log`; per-seed telemetry:
`evidence/2026-10-15/telemetry-succgrace/` (32 records, booleans as 0/1).
Proof: `scripts/test-succgrace-20261015.js` 10/10 GREEN (REAL RED 1/1,
det-gate D1/D2/D3 + D3b sanity). Sweep SMOKE + DETGATE green.

**PRIMARY (intermediate): GO — eligible 2, staged 2, violations 0.**
Two eligible sub-bar successions fired in the wild (both leadfeast armed):
s22/d148 (Emberhold trust 36 at Zoe's funeral) and s44/d115
(Thornfield trust 36 at Devon's funeral — the exact motivating case,
replayed). A grace beat staged on both (100%). Zero aloud dissolutions of
eligible links without the beat staged and resolved first (the s44 beat
lapsed at 7d and the realm dissolved aloud exactly as control; the s22
beat was still pending when the village died in its succession chain).
The base courtship policies never answer beats, so both wild beats lapsed
unanswered — the answered→held path is proven in the proof fixture
(G3/G4: gift 36+8=44, visit 38+5=43, realm holds).

**GUARDRAILS: all GO.**
- median survival: armed 128.5d = control 128.5d (bar ≥ control−10d).
- national formations: armed 5/16 = control 5/16 (bar ≥ control−2).
- no new loss mode at n≥3: lossModes control
  {n/a 11, succession-chain 2, held-to-end 2, other-named 1} vs armed
  {n/a 11, succession-chain 1, held-to-end 3, other-named 1} — no new
  mode; endReasons identical both arms
  (village-lost 10, survived 5, village-dead 1).
  Instrument note: the sweep's deathFams counter came out empty — the
  instrument called `HL.classifyDeathFamily(cause).slice(0,40)` but the
  classifier returns `{family, raw}`, not a string; the TypeError was
  swallowed by the loop's try/catch. Per-death causes weren't persisted,
  so the family distribution is unmeasured this run; the guardrail rests
  on lossModes + identical endReasons + a mechanism with no death path
  (the lever stages beats and moves trust ±8/∓6 — it cannot kill).

**SECONDARIES (report-only):**
- hold-days sum ratio armed/control: 375/337 = 1.11× (the beats bought
  time: s44's dissolution moved d115→d122, then the realm re-formed d154
  and held to end).
- aloud dissolutions: 3 → 2.
- wave reach: w4 8/16 = 8/16, w5 6/16 = 6/16. table 8/16 = 8/16,
  wins 0/16 = 0/16.

**Verdict: GO → land as its own gated commit** (SUCCGRACE=1, default OFF).

## Wall numbers

| arm | national | table | wins | wave-4 | wave-5 | median surv | max | exiled |
|---|---|---|---|---|---|---|---|---|
| control | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | 180d | 2/16 |
| armed | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | 180d | 2/16 |

Per policy: leadfeast national 5/8 both arms (the only road that reached);
belongfeast 0/8 both. All nationals were lead-road; the grace beat only
fires on Haven-primary links, so belongfeast is structurally out of scope
(0 stagings, byte-identical trajectories per D3 isolation).

## Sense-tested narratives

**1. leadfeast s44 armed d115→d122 — the grace beat in the wild (the
motivating case, replayed).** This run replays the sim-succhain s44
dissolution with the lever on, and every beat reads honestly:
- d115: "🕯️ Devon is dead — and the dead hold no treaties. Every link
  Haven has shakes." (the funeral; the −8 haircut drops Thornfield 44→36)
- d115: "Thornfield's new speaker sends word: the bond is fraying —
  trust 36, below the 40 the realm stands on. The realm will come apart
  unless the new bearer answers: send grain (1,500 kcal), send a speaker
  (2 days), or let the silence answer. Grief delays the verdict — seven
  days." (the staged beat — the fraying is named, the bar is named, the
  costs are real, the clock is real)
- d122: "Seven days of silence, and the silence answered for Haven.
  Thornfield's new speaker reads it plainly. (Trust -6.)" (the lapse —
  the base policy never answers, and the silence is said aloud)
- d122: "◈ The realm came apart — no polity answers to Haven now, and
  Haven is a free fire again. National and global no longer describe this
  village. The climb starts over." (byte-identical to the gate-off
  dissolution beat — verified in the proof, G5)

Then the realm re-forms d154 ("Four fires. One head. GOVERNANCE LAYER:
online") and holds to end (180d survived). Judge: the beat is a genuine
audience, not theater — it names the number, offers real verbs, expires
honestly, and the dissolution that follows is the same aloud ending the
control got, delayed exactly 7 days. A player answering 'gift' here holds
the realm (proof G3).

**2. leadfeast s22 armed d148 — the beat fired into a dying village.**
d148: "🕯️ Zoe is dead — and the dead hold no treaties…" then
"Emberhold's new speaker sends word: the bond is fraying — trust 36,
below the 40 the realm stands on…" The beat staged correctly (Emberhold
was the third leg at 36). The village died d151 in its succession chain
(surv 151, lossMode succession-chain) with the beat still pending — the
realm held through the window (hold 76 vs control 72). Judge: the
mechanism fired where the old code would have dissolved the realm
mid-funeral; the village's death, not the polity, ended the run. The
beat didn't save the village — it was never going to; combat killed it.
Honest.

**3. Control contrast — the s44 d115 funeral without the lever** (from the
sim-succhain instrument): funeral beat → dissolution beat, no recourse,
no audience. The lever's beat is exactly the missing middle.

## Blanks filled / documented

- FILLED (#321): sub-bar Haven-primary links at successions that would
  dissolve the realm aloud now get an answerable renegotiation beat
  (SUCCGRACE=1, default OFF). Proof 10/10, sweep PRIMARY GO, guardrails
  GO. Landed as its own gated commit.
- DOCUMENTED (instrument gap, not chased): the sweep's deathFams counter
  is empty — `classifyDeathFamily` returns `{family, raw}`; the sweep
  called `.slice()` on it. Any future sweep reusing that counter must
  read `.family`. The guardrail stands on lossModes + endReasons.
- DOCUMENTED (design observation): in the wild, both staged beats lapsed
  unanswered — the courtship policies never answer renegotiation beats.
  The lever is a player verb; sims prove it stages and resolves honestly,
  not that it gets answered. A policy-side answering layer (tribshield
  answers all beats when TRIBSHIELD=1) would be the natural next
  measurement if Steve wants the held-realm rate in sims.

## Metric review (§14)

- The pre-registered primary (intermediate) measured GO on its letter:
  2/2 eligible successions staged (100%), 0 violations. The "eligible>0"
  clause was satisfiable because the wild produced exactly the
  motivating case (s44/d115, trust 36) plus one more (s22/d148).
- The proof's D2 (gate-off byte-identical to pristine HEAD hierarchy.js
  via an override loader, 30d funeral trajectory) is the load-bearing
  evidence for the "default-off trajectories byte-identical" claim —
  stronger than determinism alone.
- No metric was re-scored mid-run. The deathFams gap is recorded above,
  not patched around: the guardrail verdict rests on the pre-registered
  loss-mode formulation.
- One judgment call for the NEXT run: the eligibility scan's rank
  approximation (scaleRows sampled daily in-trace, rank from the nearest
  scaleRow ≤ day) is coarse; both wild eligibles were unambiguous
  (national/global at the funeral), so it didn't matter here.

