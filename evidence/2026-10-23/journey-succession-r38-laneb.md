# Journey-succession r38 (lane B) — "THE VOUCH" (2026-10-23)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.
Run by oversight-playtest-loop-2 (lane B coordinator), worktree journey2-succession.

## Pre-registration

**Leg question:** r37 proved the funeral arc lands mechanically but left two
open threads:
- (a) vouch-at-the-grave fired 0/4 — the trust gate (>=60 trust for a living
  voucher at the funeral) was never met, because predecessors died at d9–10
  before anyone could earn real standing. Is the vouch a REACHABLE earned
  beat (fires when the predecessor lived and built trust), or is the gate
  unreachable in real competent play?
- (b) the social echo of the dead bearer's true name was thin (1/4 on the
  >=2-mentions bar) — does a longer-lived predecessor (more shared history)
  produce a richer echo?

This run kills at ~d40 after REAL competent play, then observes: does the
gate get met, and if so does the vouch fire (contract)? Does the echo
deepen? People check on the successor's first days under the rogue-P1
character-differentiation code (landed since r37).

**Interesting-finding criteria:**
(a) eligible-but-silent vouch → REAL BUG (contract violated);
(b) no eligibility in 4 long-life runs → gate dead in practice → BLANK for
    Steve (kill discipline: the feature works as coded; the gate number is
    the design call);
(c) echo comparison vs r37's thin echo;
(d) successor first-days voice: does the differentiation read as a new
    playstyle (Steve's directive) or a stat swap?

**Seeds:** 20001–20004 (fresh; 100xx were r37's). **Policy:** competent.
**Horizon:** phase A real competent play to ~d40 (death-aware stop), scripted
kill via the REAL playerDeath ('a hushwolf') at the first day >= 40,
successor +14d of real competent play. Funeral arc observed in the wild;
the burial act is script-driven at d+3 AFTER recording whether the
competent policy did it organically.
**Instrument:** scripts/journey-succession-r38-20261023.js (r37-derived;
voucher-eligibility snapshot pre-death, vouch contract check, trust-trap
observation lines, same telemetry contract as telemetry-baselines/succession.json).

**Binding metrics:**
- M1 (funeral arc): >=3/4 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
  Kill rule: >=2/4 deaths with NO recoverBearer → SUBSTRATE-MISSING.
- M2a (vouch contract): on EVERY seed with >=1 eligible voucher (living
  roster, not the successor, trust >= 60 at the funeral), the vouch say line
  fires. A single eligible-but-silent seed = REAL BUG.
- M2b (gate reachability): >=1/4 seeds has >=1 eligible voucher at the
  funeral → the gate is reachable in real competent play. If 0/4 → NO-GO.
- M3 (social echo, r37's bar stands): on >=3/4 seeds, >=2 true-name mentions
  of the dead bearer in VILLAGER TALK within 7 days of death. NOT re-scored
  mid-run; the question is whether long life deepens it.
- M4 (machinery): 4/4 mantles clean (linOk + moOk).
- M5 (people check): 0 identity failures across sense-read transcripts.

## What happened

| Seed | Death | Successor (trust→end) | Vouch | Echo | M1 | M3 | M4 | End |
|------|-------|----------------------|-------|------|----|----|----|-----|
| 20001 | Maya→Alma d40 (scripted hushwolf) | Alma 50→? | 3 vouchers, fired | 2 | GO | GO | GO | Alma alive, 10 villagers |
| 20002 | Arjun→Enrique d41 (scripted) | Enrique 54→55 | 3 vouchers, fired | 8 | GO | GO | GO | chain: Enrique d53 combat → Jesse; 9 alive |
| 20003 | Natalia→Miriam d41 (scripted) | Miriam 61→65 | 5 vouchers, fired | 5 | GO | GO | GO | Miriam alive, 10 villagers |
| 20004 | Jessica→Petra d10 (ORGANIC phase-A) | Petra 16→16 | 0 eligible, silent | 1 | GO | miss | GO | Petra alive, 8 villagers |

**M1: 4/4 GO.** Every death — scripted or organic — produced the death beat,
recoverBearer <redacted> 2 days ("the grave is dug by the fire"), and a completable
burial via the player-facing API. The funeral arc holds for organic deaths too.

**M2a: contract 3/3.** On every seed with ≥1 eligible voucher, the vouch line
fired. No eligible-but-silent case — no bug.

**M2b: GO — the gate is reachable.** ~40 days of competent play builds trust
63–92 across the village (20001 top: 90/89/85/75; 20003 top: 92/90/90/89),
meeting the ≥60 voucher gate. r37's 0/4 was the short-life regime (d9–10
deaths, nobody above ~30), not a dead beat. The vouch is exactly what the
ledger.js comment promises: EARNED, never free. The lines read as designed:
"At the grave, Marta, Vikram, Aki speak for Alma — 'Maya trusted them. We
saw it. Give them the fire's hearing.' The village listens." /
"At the grave, Tamika, Rahul, Ximena and 2 more speak for Miriam —
'Natalia trusted them...'". The biggest funeral in the corpus: 5 vouchers.

**M3: 3/4 GO (on the letter: 2, 8, 5, 1 ≥ the ≥2 bar).** The miss is the
early-death seed (20004, 1 mention). Pattern across r37+r38: echo depth
scales with shared history — 40 days of life → grief with texture; 10 days
→ one dream line. Not re-scored (§14); the bar stands and the finding is
the pattern, not the miss.

**M4: 4/4 GO.** All mantles linOk + moOk, including the organic d10 handoff
and the d53 combat chain on 20002.

**M5: GO (manual).** 16 transcripts sense-read. 0 real identity failures. The
one tripwire hit (20002) was an instrument regex false positive: the line
"Arjun owed me a favor. I keep thinking about collecting. Stupid." matched
the you/Arjun proximity pattern — it's a grief beat, the same one the echo
counter correctly counted. Instrument note for the next run (below).

## Village assessment (plain words)

Four villages, two regimes. The long-life three (20001–20003): the bearer
lived ~40 days, built real standing (trust in the 60s–90s), died (two by the
scripted hushwolf, Enrique organically in combat d53), and the village
mourned like a village. Funerals with speakers. The dead are remembered in
conversation unprompted: "I asked Arjun about this wound — Arjun's gone.
Still need hands. Are you in?" (the open book's re-ask, firing organically
again — r34's channel confirmed live), "Nobody says Arjun's name right yet.
We will. Give it a few days.", "I dreamed Arjun was still here. Woke up
angry at the dream. Stupid.", "The fire feels smaller without Arjun. The
rest of us will have to be bigger." Successors inherited trust 50–61 and
ran clean 14 days; trust climbed (54→55, 61→65) under competent play.

The early-death one (20004): the bot's first bearer died on her own at d10
(phase A never reached d20, let alone d40). Petra inherited at trust 16 —
the trust-trap regime, live on current master. Over the next 14 days the
meal line read "Half ration — they don't trust you yet" THIRTEEN times, the
pantry feeding everyone at +1100–1200 kcal while the bearer ate half. Her
trust did not climb at all (16→16) in 14 days of competent play — the trap
has no self-heal in the observed window. No vouchers; the funeral was
voiceless but mechanically complete (M1 GO). Two more villagers died in
those 14 days (fallen 2→4). The village survives, but it shrinks.

## People check

SENSE-TESTING LAW: 16 full transcripts read. Standouts:
- Marta d+3 (20001, trust 90): a guarded secret ("I wasn't a community
  gardener. I was a lifeguard. Someone I love needed the lie more than I
  needed the truth."), deflection when poked ("I'm not confessing it twice
  for dramatic effect."), then the grief beat: "Maya owed me a favor. I keep
  thinking about collecting. Stupid." The NPC wants something (to unburden
  on her terms); the options engage or deflect; the ending resolves.
- Marta d+14: thread continuity across the death ("We never did finish
  talking about what's been happening — that was 11 days back") and earned
  warmth ("You're family now. Chosen family — the kind that actually
  counts."). The driver-wandering filler ("Sorry, lost my train of thought")
  persists as documented.
- Albina d+3 (20004, trust 23): thin — wary deflections, a called moot,
  "You're a good listener." Tired warmth. No grief content: 10 days of
  shared history isn't enough for the village to mourn out loud, and the
  transcript reads honestly thin rather than fabricated. Not an identity
  failure — a true reflection of the thin regime.
- 0 identity failures anywhere; the dead stay dead, the living are met as
  themselves. The rogue-P1 playstyle reset (landed since r37; proof test
  green) surfaced no contradictions in dialogue — no "old bearer" artifacts.

## Blanks filled / documented

1. **PROVEN (no src change): the vouch is a reachable earned beat.** r37's
   0/4 was the short-life regime; the ≥60 gate is met by ~40 days of
   competent play and the contract fires 3/3 when eligible. Thread closed —
   no blank remains.
2. **DOCUMENTED (design data for Steve's call): the trust-trap regime
   boundary, live on current master.** 20004: d10 death → successor trust
   16 → 13 half-ration nights → trust 16→16 (no climb in 14 days) → no
   vouchers. The inheritance formula's three channels (office residue 0.4,
   vouching, own record 0.4) make early deaths punishing and late deaths
   generous; the trap does NOT self-heal under competent play in the
   observed window. The 7-day grace-period brief sits with Steve — this run
   adds the no-self-heal datum. NOT fixed (kill discipline).
3. **DOCUMENTED (design observation): echo depth scales with shared
   history.** r37's thin echo and this run's rich echo are the same
   mechanism at different tenures. No fix needed; it's the village
   remembering proportionally.
4. **DOCUMENTED (policy gap, standing): organic burial 0/4 again** — the
   competent bot never buries the bearer on its own; the rite exists in the
   UI. Same as r37.
5. **DOCUMENTED (instrument quirk, not a game bug):** one runDays call can
   advance 2 day-parts (20001 skipped d+7 convos; ledger dplus jumped
   3→14). The village continued fine; the instrument just samples fewer
   convos on such seeds.

## Metric review

- M2's bar behaved: M2a (contract) and M2b (reachability) split the question
  cleanly. Keep the split next run.
- M3 (≥3/4 seeds, ≥2 mentions): GO on the letter (3/4). The 20004 miss is
  regime-informative, not metric-hostile. Bar stands.
- Instrument fixes for the next run (committed in the r38 script this run):
  (a) identity-tripwire regex false-positives on the "X owed me a favor"
  grief line ("you ... X" proximity match) — narrow it;
  (b) `census.integrationStage` must call `Game.integrationStage()`, not
  read `state.village.integrationStage` (the telemetry LOUD line this run
  was an instrument mismatch — see Telemetry; baseline NOT rolled);
  (c) early-return TDZ on `endDay` (crashed 20004's first pass — fixed
  before the organic-death re-run);
  (d) organic phase-A deaths now recorded as the leg's death (prevId
  tracked), not skipped.

## Reachable / fun / winnable

- **Reachable:** the full funeral arc fires on scripted AND organic deaths;
  the vouch fires when earned; the open book re-asks in the wild; burial
  completable via the player-facing API.
- **Fun:** the long-life succession reads as a living village — named
  grief, thread continuity, funerals with speakers. The early-death regime
  reads honestly thin. The handoff itself is never silent anymore.
- **Winnable:** neutral for the leg — continuity machinery held on all
  seeds (Codex breadth rose where measured; books clean). The trust trap
  costs the village lives (fallen 2→4 on 20004) — data for Steve's call.

## Telemetry

`telemetry-check --baseline telemetry-baselines/succession.json`:
- **1 LOUD line: `census.integrationStage` disappeared (baseline 15 → 0).**
  INVESTIGATED, EXPLAINED: instrument mismatch — my r38 script read the
  nonexistent state field `state.village.integrationStage`; the corpus
  convention (r16–r34 scripts) calls the method `Game.integrationStage()`.
  NOT a game regression. Baseline NOT rolled. Instrument fixed in the
  committed script (next run produces clean tele).

## Design calls for Steve

1. The trust trap (standing, briefed): this run adds the regime boundary and
   the no-self-heal datum (d10 death → trust 16 → 13 half-ration nights,
   trust 16→16 over 14 days, fallen 2→4). The 7-day grace-period brief is
   still the sitting option.
2. The re-take surface narrowing (r34), the Simone zombie (r28/r29), office
   visibility/shoes-now and socially-silent funerals (r31–r33): still
   standing, untouched this run.
3. No new design calls from this run.

## Infra

- Worktree journey2-succession registered 08:56Z, heartbeated <15 min
  throughout, released at end. No lock contention (no stale lock at start).
- Pre-flight: main tree clean, disk 23%, pulled (already at 6ea142c1c).
- Instrument bug found and fixed mid-run (TDZ on early-return finish();
  organic-death misrecord as failed mantle). 20004 re-ran clean.
- Commit: instrument + evidence + this note via safe-commit.sh. No src/
  changes this run (no bug found — kill discipline).
- Rotation-b: 7 → 4 (next run: endgame).
