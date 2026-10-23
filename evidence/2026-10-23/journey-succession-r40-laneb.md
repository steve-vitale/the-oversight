# journey-succession r40 (2026-10-23, lane B): "NEW BODY, NEW HABITS — TWO POLICIES"

Leg 7 (succession). Pilot: 4 fresh seeds (30004–30007). Competent policy
pre-death to ~d40 (death-aware stop; scripted `playerDeath('a hushwolf')` only
if the bearer survived). Post-death the successor played 14 days under one of
two behaviorally-contrasting policies:
- **socialite** (seeds 30005/30007, odd): competent + talks, feasts, moots, aid
  cries, switchboard — drives social/leader/generous notes.
- **quiet-competent** (seeds 30004/30006, even): competent with
  COMPETENT_FEAST=0 + COMPETENT_AID=0 (+TALK default off) — survives, works,
  fights when found, minimal social verbs.

## Pre-registration (§11; binding per §14)
- **Question:** r39's metric review — M3 NO-GO'd because ONE policy played every
  bearer the same way. Steve's 2026-10-22 directive ("succession hands you
  someone new; that handoff should feel like a new playstyle, not a stat swap")
  + "the game notices who you are" (notePlaystyle): do the behavioral axes
  RE-DIVERGE when the successor is played differently, or is the instrument too
  social-gravitational to notice?
- **Binding metrics:**
  - M1 (reset holds): playstyle/practice/passives empty at d+1. GO: >=3/4.
  - M2 (re-noticing): modal dominant axis at d+14 of the social group differs
    from the modal dominant axis of the quiet group. GO: groups diverge.
  - M3 (people check): sense-read transcripts, 0 identity failures, and how the
    village meets the quiet successor vs the socialite one. GO: 0 failures.
  - M4 (trust trap — Steve's call, observed only): successor trust d+1/d+7/d+14.
    NO bar — datum only.
- **Interesting-finding bar:** (a) groups diverge → the game re-notices habits
  ("new playstyle" holds at the behavioral layer); (b) groups converge →
  the axis instrument is social-gravitational regardless of behavior (design
  datum, not a bug); (c) identity failures (dead-bearer <redacted> onto the
  successor) = REAL BUG.
- **Kill rule:** mantle fails to pass on >=2/4 seeds → SUBSTRATE-MISSING.
- **What this run does NOT re-prove:** M1/M2 kit+body (r39, GO 3/3), funeral
  arc/vouch/echo (r38), self-card (r14), death-cause honesty (r14).

## Results

| metric | 30004 quiet | 30005 socialite | 30006 quiet | 30007 socialite | verdict |
|---|---|---|---|---|---|
| M1 reset | GO | GO | GO | GO | **GO 4/4** |
| M2 dominant@d+14 | social | social | null* | social | **NO-GO (b)** |
| M3 voice | GO | GO | GO | n/a† | **GO 0 failures** |
| M4 trust datum | 60→90 | 56→100 | 46→63‡ | 62→88 | datum |

\* 30006 final bearer <redacted> 2 days (double chain) — <3 signals, inconclusive,
not a reset failure. † 30007 produced 0 convo reads (day-skip instrument quirk,
same class as r39's — CONVO_DAYS never landed). ‡ Fiona-era trust; d+14 not
captured after the d54 chain (instrument gap, noted not hidden).

- **M1:** playstyle={} / practice={} / passives={} at d+1 on 4/4; dominant=None
  everywhere. The reset holds on current master.
- **M2:** NO-GO as bound — finding (b). Both groups re-grew **social** by d+14:
  - 30004 (quiet): Ethan the Fisherman — {leader:58, social:76}, trust 60→90.
  - 30005 (socialite): Valentina (3rd bearer) — {leader:14, social:40, bold:1, generous:2}.
  - 30007 (socialite): Pavel (3rd bearer) — {leader:34, social:70, bold:1}, trust 100.
  - 30006 (quiet): Oliver (3rd bearer) — {} (only ~2 days as bearer, inconclusive).
  - Root cause traced: competent's SURVIVAL verbs fire the social notes —
    `assignTask` → notePlaystyle('leader'), `comfort` → notePlaystyle('social').
    Assigning villagers to work and comforting the distressed are not optional
    socializing; they are keeping the village alive. With feasts, aid, and deep
    talk all gated OFF, the quiet survivor still accumulated 134 social+leader
    notes in 14 days. **The office's survival verbs ARE social verbs — the
    job is a people job.** The axes measure the job, and any bearer who keeps
    the village alive re-grows social/leader regardless of behavior. This is the
    honest answer to r39's metric-review question, and a design datum for
    Steve (see metric review) — not a bug, so nothing was changed (kill
    discipline).
- **M3:** 0 identity failures across 5 sense-read transcripts (30004×2,
  30005×2, 30006×1). The dead are grieved by NAME with concrete detail:
  Paisley on Brooklyn — "Brooklyn owed me a favor. I keep thinking about
  collecting. Stupid." (the line that tripped r39's instrument — proven honest
  grief again, addressed to Ethan, no confusion); Vasyl on Chloe — "Chloe
  always took the burnt piece. Said someone had to. I take it now." Successors
  are met as themselves: Oliver braids grass and warns "Watch the quiet ones";
  Valentina — no shared words (Spanish only) — builds trust nonverbally
  ("You tap your chest, then theirs. Us."). Paisley pushes back on the driver's
  probing ("I told you the truth. You can keep poking it, but it's told.") —
  real boundaries, not a static menu.
- **M4:** no trap regimes in r40 — all inheritances ≥46 (30004: 60, 30005: 56,
  30006: 46, 30007: 62), and trust CLIMBED post-handoff in every seed. The
  7-day grace-period brief stays with Steve; this run adds the datum that the
  formula's floor+vouch+own-record channels produced warm starts throughout.

## Village assessments (plain words)

- **30004 — the fisherman's fortnight (quiet).** Brooklyn Wen (street artist,
  "the Beloved") died to a hushwolf d41. Ethan the Fisherman woke with trust 60,
  kept 7 alive, integration stage 3. The village warmed to him through deeds,
  not talk: trust 90 by d+14, Hanan accepting the party invite ("Okay. Yeah.
  I trust you"), Paisley confiding the candy bar. A quiet leader works.
- **30005 — three bearers, one fire (socialite).** Chloe the tailor died
  organically d41 → Daniela the plumber (trust 56) → Daniela died d49 →
  Valentina the crossing guard. The socialite policy talked its way through the
  grief: Vasyl's sickness, Valentina's wordless trust scene, trust climbing
  56→100 through the chains. 10 alive, integration stage 3. The village
  endures the office changing faces twice in 8 days.
- **30006 — the aquarium keeper's day (quiet).** Brooklyn (appliance repair
  tech, "the Indispensable") → Fiona (aquarium keeper, trust 46) scripted d41;
  Fiona died in combat d43; a third bearer, then Oliver the mushroom grower
  from d54. 8 alive, 6 fallen — the costliest village of the pilot. Fiona had
  one day. The chains are wave pressure, not the handoff (see below).
- **30007 — the forager's week (socialite).** Jamie the locksmith ("the
  Beloved") → Wanjiru the wild-food forager (trust 62) scripted d40; Wanjiru
  died in combat d42; → Pavel the bush pilot from d47, trust 100 by d+14.
  9 alive, 3 fallen, integration stage 3.

## The chains (telemetry deviation context)

3/4 seeds chained (30005, 30006, 30007 — two with double chains = 3 bearers
each). Total: **10/10 mantle passes clean** (single + double chains) — the
deepest chain coverage the leg has had: lineage records, mantleOf, the trust
formula, vouch beats, corpse recovery, and the identity sync all held through
triple mantles. The chain deaths were wave pressure in the d42–54 window
(Fiona d43 "combat", Wanjiru d42 "combat"; 30005's d49 chain cause was not
instrumented), with trust CLIMBING in every case — not the trust trap, not a
handoff failure. The predecessors died at d40–41 (one scripted hushwolf, one
organic); the successors stepped into wave-1/2 pressure with non-fighter kits
(aquarium keeper, wild-food forager, plumber) and competent's fight-forward
habits. Regime + small-n, not a regression — verdict under Telemetry below.

## People check (SENSE-TESTING LAW)

5 transcripts sense-read (30007's day-skip quirk left it convo-less):
- **Hanan d+3 (30004, trust 90, quiet):** opens with a wound-cleaning want;
  the driver's deflecting choice fizzles into the known "lost my train of
  thought" filler; the naming debate is alive content; the party invite
  engages ("I trust you"). Mixed — want existed, deflection produced filler.
- **Paisley d+10 (30004, trust 90, quiet):** confides, sets boundaries,
  grieves Brooklyn by name, accepts the watch-your-back invite. PASSES.
- **Oliver d+10 (30006, trust 90, quiet):** reads the room, teaches blackberry
  knowledge ("And I've been walking past it for weeks"), ends warm. PASSES —
  the third bearer has her own voice.
- **Valentina d+3 (30005, trust 90, socialite):** Spanish-only, fully
  nonverbal, mutual trust built through gesture. The language-barrier system
  working as designed. PASSES.
- **Vasyl d+3 (30005, trust 71, socialite):** sickness want with honest
  mechanics ("Move next to them, on the same side of the Haven door, to
  help"), grieves Chloe with concrete detail ("took the burnt piece"). PASSES.

## Blanks filled / documented

1. **DOCUMENTED (design datum, the leg's open question answered):** the
   behavioral axes cannot differentiate successor playstyles because the
   office's survival verbs are social verbs (assignTask→'leader',
   comfort→'social'). "The game notices who you are" notices the job. The
   "new playstyle" evidence for Steve's directive lives at kit (r39 M1), body
   (r39 M2), and voice (r39/r40 M4) — not at the axes. If axes are to
   differentiate, non-social survival verbs would need noting (e.g. a
   'provider' axis for haul/kcal work, a 'fighter' axis for hunt kills) —
   that's a Steve design call, NOT a worker change (kill discipline).
2. **PROVEN (no src change):** 10/10 mantle passes clean through triple
   mantles — the deepest chain coverage of the leg. Kill rule not triggered.
3. **DOCUMENTED (instrument):** a sibling's /tmp cleanup wiped the run's
   scratch logs mid-run (second sighting of the class — AGENTS.md's
   SWEEP OUTPUTS lesson; evidence in the repo survived, reruns are
   deterministic); 30007's day-skip convo gap (CONVO_DAYS never landed —
   same class as r39's runDays 0-day quirk).
4. **DOCUMENTED (datum for Steve's call):** r40 produced no trap regimes
   (inherits 46–62, trust climbing everywhere). Adds to r38/r39's wild-trap
   data points.

## Reachable / fun / winnable (succession leg)

- **Reachable:** yes — successions fired on all 4 seeds (1 scripted, 3 with
  organic or chained organic follow-ons); the handoff machinery fired every
  time, 10/10.
- **Fun:** yes — the chain regime shows the village endures: Oliver's
  grass-braiding read, Valentina's wordless trust scene, Paisley's
  grief-by-name. The village-as-protagonist thesis survives triple mantles.
- **Winnable:** yes for the leg — continuity held through three bearers in
  one run; nothing in the transfer blocks progression. (Trust-trap regime is
  Steve's open call, unchanged.)

## Metric review

- M2's NO-GO is the answer, not a miss: the metric asked whether
  behaviorally different play re-diverges the axes; the game says no, because
  the survival verbs ARE the social verbs. Proposed revision for the next
  run: retire axis-divergence for the succession leg; if "new playstyle"
  needs behavioral measurement, count verb usage (fights joined, hauls,
  foraging trips, conversations) rather than notePlaystyle axes. NO
  re-scoring this run.
- M3 drew on 3 seeds (30007's day-skip left it convo-less) — instrument quirk,
  documented; the 0-failure bar stands on 5 sense-reads.
- Telemetry: `telemetry-check.js` vs succession.json — **LOUD**
  deaths.bearer 5→9 (+80%), census.fallen 10→19 (+90%). Investigated same-run:
  EXPLAINED — a chain-heavy 4-seed sample (9 bearer deaths across 4 files vs
  baseline 5); the instrumented chain deaths were post-handoff combat under
  wave pressure with trust climbing, no handoff failure; 30004 matched the
  baseline regime (1 bearer death, 5 fallen, 7 alive vs baseline's quieter
  runs). NOT a regression. Baseline NOT rolled (no src changes; a
  high-variance sample should not fold into the baseline).

## Files
- scripts/journey-succession-r40-20261023.js — the r40 leg harness (two-policy
  post-death contrast; quiet-competent env-gated wrapper; deterministic
  re-runnable: seed 30005 re-ran byte-identical evidence)
- evidence/2026-10-23/journey-succession-r40-laneb.md — this note
- evidence/2026-10-23/journey-succession-r40-tele-3000{4,5,6,7}.json — per-seed telemetry
- evidence/2026-10-23/journey-succession-r40-transcript-*.txt — 10 transcripts
