# Journey succession r53 — DEED-CALLER + TEACH-NEW (lane B, pre-registration 2026-10-27, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r52's metric-review next steps. Instrument only, zero
src/js changes. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The next steps (from r52's run note + metric review)

1. DEED-CALLER (r52 review: retire the five-gate framing). r52 answered
   deed-trigger gates as "none of these five": teachable pairs never 0,
   hall gate rarely closed, pack rarely empty, kcal gate non-operative
   (49/49 donate deeds below the 1.5x-cap gate; 12 multi-transfer days
   vs the gated call's 1-transfer cap). The next question is the policy
   path, not the gate. This run captures, on every deedLedger entry,
   the caller stack site (like the r50 bump trap) plus a stack head
   (first 4 .js frames), so the analyzer can map each deed to its
   policy path: teachRound lesson, conversation teach choice, haul
   donation (donateHaul), daily gated donation (donateSurplus direct),
   or other. The analyzer also prints a per-day policy-path census:
   for every post-death day, deeds by path class, so deed days
   contrast against no-deed days by path, not by gate.
2. TEACH-NEW (r52 review). r52: 40/40 teachPlant deeds taught an
   already-known plant (targetKnowsBefore true, trust delta 0), and
   the competent policy's teachRound comment says it "could never
   teach anything new as written". This run tests whether ANY path
   teaches a new plant in the wild: any teachPlant deed with
   targetKnowsBefore === false, reported by caller. Zero across the
   band is a policy finding to carry to Steve, not a silent gap.
3. W1d-tightened POOLED HEADLINE (r52 review). The bar stands
   (>= 1/2); the headline is the pooled share across seeds, with
   per-seed shares alongside, and seeds contributing nothing are
   named plainly (an empty subset is not a miss).
4. MATURE REGIME AS STAGING ASPIRATION (r52 review). Organic
   pre-emption is 5/6 across r50–r52. EARLY_KILL_DAY=40 is a staging
   aspiration, not a regime guarantee: the analyzer reports the
   staging rate (scripted vs organic among mature seeds) and the
   verdict honors scripted-or-organic on every seed.
5. CARRIED, UNCHANGED: SCRIPT, V1, C1v3, W1a, S1, MG2v2 (old MG2
   reported, not judged), M3v2b (bar stands: >= 2 mentions on >= 4/5
   seeds; the bar question — scaling with village size/age, or
   counting from the funeral — is carried, NOT ruled here), M1, M4,
   M5, over-cause, died-between, chain-death cause-known, solo
   continuity count. C1v2 stays DROPPED.
6. FORAGING-OUTING BLANK: documented only, as in r52. Not built,
   not re-tested as a verdict.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's
table does not cover the lineage/mantle machinery). This run invents
no canon; it measures the machinery r38–r52 exercised, under Steve's
2026-10-23 meal-gate ruling (established-villager successors eat full
at any trust). CANON.md's "Trust ≠ reputation" (gossip/rumors move
REP only, never trust) remains relevant: a trust move with a donation
line is a deed writer, not a gossip artifact.

## Leg question

On a mixed band with a 45-day successor window, which policy path
produces each deed — and does any path ever teach a villager a plant
they do not already know?

## What counts as an interesting finding

- DEED-CALLER: every deedLedger entry carries a non-null site, and
  one path class accounts for >= 80% of donate deeds on a seed, or
  the deed days split cleanly by path (haul days vs gated days) —
  the trigger is identified as a path, not a gate.
- DEED-CALLER MISS: sites are null/unmappable on >= 20% of deeds, or
  no path split appears — the instrument reports the residue honestly;
  no re-scoring.
- TEACH-NEW: >= 1 teachPlant deed with targetKnowsBefore === false —
  a new-teach path exists in the wild; the analyzer names its caller.
  Or: zero across the band — teaching in the wild is re-teaching
  only, a policy finding for Steve.
- Any carried bar regressing (V1 FAIL-alive-silent, MG2v2 violation,
  M4 unclean mantle) is a REAL BUG, not a metric note.

## Binding metrics (§14)

- SCRIPT (young staging): 2/2 day-5 seeds with death.scripted === true.
  Mature seeds: scripted-or-organic honored, reported per seed, plus
  the staging rate (scripted / mature seeds).
- V1 (vouch snapshot, carried): on every seed with eligibleAtDeath > 0,
  verdict PASS-fired; no FAIL-alive-silent anywhere.
- C1v3 (transition rule, binds): 100% of post-death daily transitions
  covered by a callMove on the ENTRY's day OR a convoWindowMove on the
  PREVIOUS entry's day.
- W1a (mutation-trap completeness, binds): 100% of daily office
  transitions carry a classification: bump / donation / deed /
  direct / handoff / unexplained.
- W1d-tightened (donation join, binds as a finding bar, not a game
  bar): POOLED share across seeds of transitions in the TIGHTENED
  subset (r50 single-label direct, or solo-office with r50 class
  deed) carrying a donation line on their covering call >= 1/2.
  Per-seed shares alongside; subset-empty seeds named, not scored.
- S1 (bearer-own delta, carried): 100% of same-bearer officeCallMoves
  carry a numeric bearerDeltaExact; 100% of chain handoffs carry null;
  every solo-office call has |delta| <= 2 (a >= 3 solo-office delta is
  an instrument contradiction — fail loudly, not a game finding).
- MG2v2 (meal-line only, binds): 0 violations on 5/5 seeds. Old MG2
  reported, not judged.
- M3v2b (social echo, carried): on >= 4/5 seeds, >= 2 v2b mentions of
  the dead bearer within 7 days of death (funeral-arc lines excluded,
  loot lines excluded by the /^You take /i rule). v2 reported alongside.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer within 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.
- DEED-CALLER (finding bar, not a game bar): the analyzer must print,
  for every seed, deeds by path class and the per-day path census; a
  seed with zero deeds in the window must have its path census
  reported (all paths silent, not "no data").
- TEACH-NEW (finding bar, not a game bar): the analyzer must print,
  for every seed, teachPlant deeds split by targetKnowsBefore and by
  caller; the band total of targetKnowsBefore === false is the verdict
  number.

## Seeds / policy / horizon

Seeds 26081–26085 (fresh band: r52 used 26071–26075).
Policy: competent (same as r41–r52). Regimes: 26081, 26082
EARLY_KILL_DAY=5; 26083, 26084, 26085 EARLY_KILL_DAY=40 (staging
aspiration; organic pre-emption honored and counted). Horizon:
POST_DAYS=45 (same as r50–r52). Convo checkpoints d+3/4, d+7/8,
d+14, d+30/31, d+45, same as r52.
