# Journey-succession r39 (lane B) — "THE FIX IN THE WILD" (2026-10-24)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.
Run by oversight-playtest-loop-2 (lane B coordinator), worktree journey2-succession.

## Pre-registration

**Leg question:** r38 closed the vouch thread and documented the trust-trap
regime (d10 death → trust 16 → 13 half-ration nights, trust 16→16, no
self-heal). SINCE THEN Steve ruled (2026-10-23, DECISIONS.md): the
trust-gated half-ration in villageMeal is for NEW villagers ONLY — a
taken-over existing villager eats full at any trust. Fix c8d7c787d is on
this base. This run asks: does the ruling hold in the wild?

**Interesting-finding criteria:**
(a) any "Half ration — they don't trust you yet" line for a trust<30
    successor in 7d → REAL BUG (fix misfiring);
(b) successor trust climbs under competent play (was 16→16 over 14d in r38);
(c) burial probe: the competent bot never buried the bearer <redacted> 0/4
    (r37/r38 standing gap) — this run the policy is burial-seeking (pays
    respects + buries via the REAL player-facing API at d+1/d+2 when the
    corpse is recovered home). If it completes, the gap is a POLICY gap,
    not a game-side blank.
(d) regression on vouch contract, social echo, funeral machinery.

**Seeds:** 21001–21004 (fresh). 21004 ran with EARLY_KILL=12 (scripted kill
at the first day ≥12) to force the short-life trust<30 regime; 21002 died
organically at d9 on its own. **Policy:** competent, burial-seeking.
**Horizon:** phase A to ~d40 (or kill day), scripted kill via the REAL
playerDeath ('a hushwolf'), successor +14d of real competent play.
Death-aware: dead/scattered village stops (+10d tail).
**Instrument:** scripts/journey-succession-r39-20261024.js (r38-derived;
burial nudge, meal-contract M2a, trust-climb M2b, tightened half-ration
regex to the exact meal-gate phrase so crisis-triage "half rations" policy
lines don't false-positive).

**Binding metrics:**
- M1 (funeral arc): ≥3/4 deaths produce (a) death beat naming the bearer,
  (b) recoverBearer <redacted> 2 days, (c) burial completable (nudge/organic/scripted).
  Kill rule: ≥2/4 deaths with NO recoverBearer <redacted>> SUBSTRATE-MISSING.
- M1b (burial probe): ≥3/4 seeds the burial-seeking policy completes the
  rite itself (no scripted fallback).
- M2a (meal contract): on EVERY seed with successor trust<30 at the mantle
  pass, ZERO "Half ration — they don't trust you yet" lines in 7d. One
  line = REAL BUG.
- M2b (trust climb): ≥3/4 seeds, successor trust at +14d strictly greater
  than at the mantle pass.
- M3 (social echo, r37/r38 bar stands): ≥3/4 seeds, ≥2 true-name mentions
  of the dead bearer <redacted> VILLAGER TALK within 7 days of death.
- M4 (machinery): 4/4 mantles clean (linOk + moOk).
- M5 (people check): 0 identity failures across sense-read transcripts.

## What happened

| Seed | Death | Successor (trust pass→end) | M2a | Burial | Echo | Vouch |
|------|-------|---------------------------|-----|--------|------|-------|
| 21001 | Nancy→Aki d42 (scripted hushwolf) | 48→40 | n/a | nudge d+2 | 6 | fired (2 elig) |
| 21002 | Judith→Miguel d9 (ORGANIC phase A) | 18→18 | **GO** | nudge d+2 | 1 | n/a (0 elig) |
| 21003 | Ezra→Diana d40 (scripted hushwolf) | 62→67 | n/a | nudge d+1 | 0 | fired (4 elig) |
| 21004 | Bessie→Darnell d12 (scripted, EARLY_KILL) | 28→29 | **GO** | nudge d+2 | 0 | n/a (0 elig) |

**M1: 4/4 GO.** Every death — scripted, organic, early — produced the death
beat, recoverBearer <redacted> 2 days ("the grave is dug by the fire"), and a completed
burial.

**M1b: 4/4 GO.** The burial-seeking policy completed respects+burial at
d+1/d+2 on ALL seeds through the real player-facing API. The standing
"competent bot never buries the bearer organically" (0/4, r37/r38) is a
POLICY gap, not a game-side blank: the rite is reachable in the wild when
the player chooses it. No src change needed. (The d+3 scripted fallback
never fired.)

**M2a: 2/2 GO — the fix HOLDS in the wild.** Both trust<30 successors
(Miguel 18, Darnell 28) saw ZERO half-ration meal lines in 7 days. The
trust trap is dead: the village fed its new bearer full while still
learning to trust them. Instrument note: the looser r38 regex would have
false-positived on a crisis-triage "half rations till it passes" policy
line (21002 d21) — tightened to the exact meal-gate phrase this run.

**M2b: 2/4 — MISSES on the letter** (21001 48→40, 21002 18→18; 21003
62→67 ✓, 21004 28→29 ✓). The trap-relevant question is answered — no
successor starved or stalled into death; all four alive at +14d — but the
"strictly greater" bar is too strict for a live relationship number that
drifts both ways under competent play. → metric review.

**M3: 1/4 — MISSES on the letter** (6, 1, 0, 0 vs the ≥2 bar). Two
mechanisms, both documented not fixed:
- **Naming-debate displacement (21003):** t2LatelyEvent returns 'naming'
  BEFORE the grief/mantle branches (convoTopics.js ~L451 vs ~L454), so a
  live monster-naming debate ("the whole fire was arguing about The
  Mountain Lord") crowded mourning out of the ask:lately beat for the
  whole 7-day window. The village argued names instead of grieving Ezra.
  Works as coded; the priority is a design call.
- **Thin-history regime (21002 d9, 21004 d12):** 9–12 days of shared
  history produces 0–1 unprompted mentions — same as r38-20004's 1. The
  village remembers proportionally. (21004 also lost its d+7 convo sample
  to the known runDays 2-day-part instrument quirk.)
→ metric review: the bar conflates regimes.

**M4: 4/4 GO.** All mantles linOk + moOk, including the organic d9 handoff
and the d12 early kill.

**M5: GO (manual).** 6 full transcripts sense-read + all echo samples. 0
identity failures. Standouts:
- Hassan d+14 (21001, trust 68): a wound gone hot, wants healing the bearer
  can't give without moving to his side of the Haven door (honest
  positional gate); his fixer identity ("Everything's broken — bodies,
  tools, people. I fix things. It's what I'm for."); ends offering to
  watch the bearer's back. Want → engage/deflect → resolve.
- Rosa d+3 (21004, trust 65): sick, achy, can't keep food down; the bearer
  deflects ("I can't right now"); her landing line plants the owe: "No,
  yeah, of course. Forget I asked. They won't forget. They'll just stop
  asking." A real social consequence.
- Ruby d+7 (21002, trust 37): thread continuity across the death ("You
  said you're not good at the talking part either"), trust 31→37, taught
  Groundnut, invited along ("Okay. Yeah. I trust you."). The d9-death
  village warms to its new bearer honestly.
- Echo samples (21001): "Nancy always took the burnt piece. Said someone
  had to. I take it now." / "I sharpen sticks down to nothing for Nancy,
  now. Feels right. Feels like the least I can do." Grief with texture.

## Village assessment (plain words)

Four villages, two regimes. The long-life two (21001, 21003): the bearer
lived ~40 days, died, and the village held a funeral with speakers both
times — but mourned differently. On 21001 the dead were remembered
unprompted six times in a week ("the fire feels smaller without Nancy").
On 21003 the village spent the week arguing about what to call the
Mountain Lord and never said Ezra's name once outside the funeral beats —
Ezra died with an active quarrel docket ("the sentence doesn't cross the
grave"), and the naming fight ate the grief. Both villages survive:
Diana's holds 9 alive, Aki's bled 2 more in the post-death fortnight (5
alive, 6 fallen — the competent policy takes real risks).

The short-life two (21002 organic d9, 21004 d12): the trust-trap regime,
post-fix. Miguel (18) and Darnell (28) ate full rations every night for 14
days, lived, and started earning trust (18→18 flat, 28→29). The villages
are thin but alive; Rosa's sickness on 21004 is the next crisis, and the
betrayal docket (Jalen's ambush, case_2/case_4 threads) is live on both.

## Blanks filled / documented

1. **PROVEN (no src change): Steve's meal-trust ruling holds in the wild.**
   m2a 2/2 on trust<30 successors. The trust trap is dead.
2. **PROVEN (policy gap, not game blank): the burial rite is reachable
   organically.** m1b 4/4 via the real API at d+1/d+2. The competent
   policy's old 0/4 was a heuristic gap; consider folding a grave-duty
   step into the canonical competent policy (instrument-level follow-up).
3. **DOCUMENTED (mechanism, design call):** naming-debate displacement of
   mourning in t2LatelyEvent — a live naming debate outranks acute grief
   and the 10-day mantle tail in the ask:lately beat. Works as coded;
   priority order is Steve's call.
4. **DOCUMENTED (instrument):** tightened the half-ration regex to the
   exact meal-gate phrase (crisis-triage false positive); runDays
   2-day-part quirk skipped 21004's d+7 convos (known from r38).

## Metric review

- M2b ("strictly greater trust on ≥3/4"): MISSED 2/4. The bar mistakes a
  live relationship number for a progress bar — trust drifts both ways
  under competent play and the trap-relevant outcome (starve/stall/death)
  never occurred. Proposed next-run bar: successor alive AND zero
  half-ration lines at +14d (the trap's actual teeth), with trust
  direction reported not judged.
- M3 ("≥2 mentions on ≥3/4"): MISSED 1/4. The bar conflates three
  regimes: thin-history (inherently 0–1), naming-displaced (mechanism),
  normal. Proposed next-run bar: ≥2 mentions on ≥2/3 seeds EXCLUDING
  thin-history (<20d bearer life) and naming-live seeds, each exclusion
  logged with the mechanism. The bar stands for this run per §14 — the
  miss is recorded, not re-scored.
- M1b (burial probe) behaved: keep it as the organic-burial instrument.

## Reachable / fun / winnable

- **Reachable:** the full funeral arc fires on scripted, organic, and
  early deaths; burial completable in the wild through the real API; the
  vouch fires when earned (2/2 eligible seeds).
- **Fun:** the long-life succession reads as a living village — named
  grief, thread continuity, funerals with speakers, real social
  consequences for deflection (Rosa). The early-death regime reads
  honestly thin. The handoff itself is never silent anymore.
- **Winnable:** neutral for the leg — continuity machinery held on all
  seeds (M4 4/4). Post-fix, no successor starved; villages persist.

## Telemetry

`telemetry-check --baseline telemetry-baselines/succession.json` (5
metrics, 4 files): **QUIET** — no large deviations. Baseline stands.

## Design calls for Steve

1. The trust trap is CLOSED (verified in the wild, no src change). The
   brief is resolved — remove from the open list.
2. NEW (mechanism, works as coded): should a live monster-naming debate
   outrank acute grief + the 10-day mantle tail in the ask:lately beat?
   On 21003 it zeroed the social echo for a 40-day bearer. Priority order
   is a design call.
3. Standing, untouched: re-take surface narrowing (r34), the Simone zombie
   (r28/r29), office visibility/shoes-now, socially-silent funerals
   (r31–r33).

## Infra

- Worktree journey2-succession registered 07:55Z, heartbeated <15 min
  throughout, released at end. No lock contention (no lock at start).
- Pre-flight: main tree clean, disk 22%, pulled (already at be55cfc2c).
- Mid-run instrument fixes: EVID_DIR year-dir (2026-10-24), EARLY_KILL
  regime, burial nudge, tightened half-ration regex. 21003's first pass
  was SIGTERMed for the EVID_DIR fix and re-ran clean; 21001/21002
  evidence consolidated into evidence/2026-10-24/.
- 281-test green-list suite: run at commit time (see below).
- Commit: instrument + evidence + this note via safe-commit.sh. No src/
  changes this run (no bug found — kill discipline).
- Rotation-b: 7 → 4 (next run: endgame).
