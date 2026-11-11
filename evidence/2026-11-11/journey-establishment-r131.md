# Journey r131 — establishment, Lane A (2026-11-11)

Leg 1, days 14–40, 42-day horizon. Run `playtest-loop-a-20261111T0045Z`.
Branch `journey-establishment`, base local master `ec7335bd7` (Loop B
conjurefix evidence landing). Policy: competent + withDelegate +
HUNTSTAFF=2. Seeds 2301–2316 (fresh band), BEFORE/AFTER pair on the same
band. Prereg: `journey-establishment-r131-prereg.md` (this directory).

## The leg's question (Q1 — the ladder's missing rungs)

r128 judged dial (a) GO, but every move was still preserver/butcher: cook,
spotter, builder moved nobody (foodXp totals preserver 399 / butcher 71 /
rest 0). Routine-work grant sites existed only for `butcher` (hunt kill)
and `preserver` (rack batch). A cook resolved ~2x/day doing haven cooking
and smoke racks, but all its XP landed in `preserver`; cook XP stayed 0.
`mend` resolved 0 times on the r128 panel (the competent policy never
assigns it) and builder had no grant site at all. Spotter has no effect
("future: faster ID") — no grant, since granting XP toward a skill that
does nothing would be fake progress.

## The fix (worktree `src/js/game.js`, +22 lines, `node --check` OK)

- **Cook:** one `foodXp['cook']` rep per cook resolution via
  `grantFoodXpCredit` (same dial as preserver/butcher: first 5 XP 1:1,
  then 1 XP per 2, odd unit carried). The work is the meal, not the racks
  — the grant fires whether or not any batch preserved.
- **Mend:** one `foodXp['builder']` rep per mend resolution, same helper.
- **Per-day cap (the pilot revision):** the uncapped pilot raced — five
  cooks hit skill 3 in 42 days (pace03 cook+builder 5 on 4 seeds), because
  a cook resolves ~3x/day. Each grant now fires only on the FIRST
  resolution of that task per villager per day, tracked as
  `foodXpDay[task]` on the person record. A daily cook reaches skill 1 in
  5 days, skill 2 in ~25; skill 3 needs ~55 days, so it cannot race inside
  the 42-day leg. Later resolutions still count for practice/competence;
  only specialist XP is capped. Fiction: the first meal of the day teaches;
  the rest is routine.
- Spotter: no grant site (the remaining blank — the spotter effect itself
  is the next build).

Proof test `scripts/test-journey-establishment-r131-cook-builder.js`:
**43 passed, 0 failed** — source checks incl. the cap (J2/J3), analyzer
synthetics, live rung checks, live grant events incl. same-day cap (Y2/AB2)
and next-day reset (Y3/AB3), fix-isolation (stubbed helper → byte-identical
pantry/gives), det-gate (two driver runs byte-identical).

## Pilot (4 seeds, 2301–2304, capped fix)

- Cook XP >0 on 4/4 seeds (207 grants, was 580 uncapped); cook moves on
  4/4; max cook XP 20 (Greta, 2303) — nobody reaches skill 3.
- **Pace03 cook+builder = 0** (was 5 uncapped). The cap did its job.
- Builder moves 1/4 (Vyacheslav 0→1, 8 XP, 2302 — the only mend seed).
- Spotter 0. Q2 PASS (4/4 answered), Q3 PASS (0 null).
- 2301–2303 AFTER headlines byte-identical to BEFORE; 2304 diverged
  slightly (deaths 63→56, pantry 63,040→66,309) — one seed's trajectory
  moved when a cook's new skill changed an assignment. Pilot GO.

## Full panel (16 seeds) — VERDICT: Q1 GO

| Metric | AFTER | Bar | Verdict |
|---|---|---|---|
| Q1a cook moves | **14/16** | ≥4 | PASS |
| Q1b builder moves | **3/16** | ≥2 | PASS |
| Q1c pace03 cook+builder | **0** | ≤4 | PASS |
| Q1d preserver/butcher moves | **15/16** | ≥8 | PASS, no regression |
| Q1e spotter foodXp total | **0** | 0 | PASS |
| BEFORE-validity | cook moves 0, cook practice >0 on **16/16** | ≥12 | VALID |
| Q2 invitations answered | **25/26 = 96%** | ≥80% | PASS |
| Q3 null THEM lines | **0** | 0 | PASS |
| M3 survive d42 | 16/16 | ≥12 | PASS |
| M4 zero starvation deaths | 16/16 | ≥12 | PASS |

Ladder detail: foodXp totals BEFORE 637 → AFTER 1309. By task AFTER:
butcher 196, cook 542, preserver 447, spotter 0, builder 124 (BEFORE:
butcher 194, cook 0, preserver 443, spotter 0, builder 0). Grant events:
634 cook grants (16 seeds), 124 mend grants (5 seeds), 307 rack
resolutions granting preserver XP, 228 of 319 hunt kills granting butcher
XP. Cook moves on 14/16 seeds (no cook move on 2311, 2316); builder moves
on 3/16 (Vyacheslav 2302, Jalen + Thuli 2305, Nora 2309 — Thuli and Nora
reached builder 2). First ladder move lands in d1–d14 on 15/16 seeds.

## Metric review

- The per-day cap is the whole story of this run: uncapped, the dial
  raced (5 cooks at skill 3 in 42 days); capped, pace03 is 0 while cook
  moves stay at 14/16. The ladder now pays for *doing the work every day*,
  not for doing it three times a day. Bars unchanged — the revision was a
  pilot-stage mechanism fix, not a mid-run re-score.
- Ladder-wide pace03 (descriptive, all tasks) is 1: Ayan the baker
  (seed 2312) went preserver 0→3 on 33 XP in 42 days — racks pay
  per-batch with no cap, so a dedicated preserver races the same way the
  cook did pre-cap. The binding bar covers cook+builder only, so this is
  not a verdict — but the next establishment run should ask whether the
  preserver/butcher grants want the same first-of-the-day cap. (The
  r128 dial accepted the per-batch shape; the question is now evidence,
  not a hunch.)
- Q2's one unanswered invite (seed 2308, Eli: "Walk my trap line with
  me?" followed by the conversation winding down to "That's enough
  talking for me.") is the denominator working as designed — a spoken
  invite the conversation never answered. Accept 23, decline 2: the two
  declines both came at trust 2–6, the accepts at trust 47–91 — villagers
  choose by character, as ruled.
- Two seeds (2310, 2316) ran to endDay 44 instead of 43 — one extra day
  ticked somewhere (both also show npcCraftCalls/care 43). M3 reads
  aliveAt40, so no verdict is affected; watch whether it recurs.
- Seed 2314's pantry reads 37,953 at the guardrails snapshot and 31,453
  at endDay — the 6.5k gap is the d40→d43 drift, not a bug.

## Village assessment (plain words)

Sixteen villages, all alive at day 42 — nobody scattered, nobody starved
(0 starvation deaths on every seed). Deaths run 32–78 per village over the
leg (most in the 50s), 8–12 people still standing at day 40, pantries from
~21k kcal (seed 2307, the lean one — 8 alive, wave 4 reached) to ~150k
(2308). Thirteen villages reached wave 4; three (2304, 2310, 2311) sat at
wave 3. One hunter-wound death (§14c): David, seed 2312, hunting.

The fix changed almost nothing about how villages *live*: 11 of 16 AFTER
headlines are byte-identical to BEFORE (same deaths, same pantry, same
alive count), and the other five moved by a few deaths or a few thousand
kcal. That is the right shape for a ladder fix — the village's fortunes
don't change, but the people in it now *become* something: 14 of 16
villages end the leg with a self-taught cook, 3 with a self-taught builder,
and the first ladder move lands in the first fortnight on 15 of 16 seeds.
The cook who feeds the haven every day is now, visibly, learning to cook.
What the leg still doesn't give anyone is the spotter's job — a villager
can stare at the wild all day and learn nothing from it, because "faster
ID" is still a comment, not an effect. That blank is the next build.

## People check (all 16 AFTER convo files read in full, 64 convos)

Conversations hold up as people talking: wants are real (a candy bar saved
for better days, a wound that needs a second pair of hands, a taken sister
to ask the System about), answers engage or deflect, endings resolve or
plant. The non-verbal conversations are the best thing in the panel — four
villagers speak no shared language (Daniyar and Ayan in Russian, Rune in
Norwegian, Jean in Arabic) and the mime-and-nod exchanges land, including
the shared joke of the one English word they know. The party-naming flow
works and the names have rotated (this panel: "PLOT ARMOR", System-suggested).
The favour-line variety from r129 is working: the old "Move next to them"
line is gone (0×), replaced by five distinct wordings. The "eighty-one...
boring" beat and the MEAT AND FRIENDS / APEX SNACKS pool are absent this
panel.

Still repeating — carried to the next run (deepening, r132):

- **The taken-kin telling is one template with slots (9×).** "It's my
  [sister/grandfather/spouse/aunt], [name]. [Was taken at the Scattering /
  Went in the Taking]. [The boring half, they said — / She was nineteen. /
  She laughed like a screen door in a windstorm.] Some nights I [dream
  about the pods — rows of them, humming / swear I hear them before I
  sleep — the pods, rows deep, humming / The pods get into my sleep some
  nights. Row on row of them, humming like a held note]." The kin details
  vary (Sofia, Bruno, Michiko, Rahul, Fiona, Grace, Guizhen, Symbat) but
  the dream sentence is one of three wordings. The screen-door laugh
  survives once (Salvador's aunt Fiona, ex-Rachel).
- **"Something in them almost softens — then doesn't. Not yet." — 8×.**
  The top canned line, unchanged from r128 (5×).
- **"They hear the warmth in it." — 6×** (was 9×).
- **Deflect pivot "Sorry — I shouldn't load that on you. What's up?" — 6×**
  (was 4×).
- **Field-teaching closer "Remember the leaf, the stem, the smell — that's
  the whole of it." — 9×**, plus the place line "a [burned farmhouse /
  ridge with a view] — I'll show you on the map sometime. It's real." (5×).
- **Quiet-place walk outcome "shows you where they go to think. 'Don't
  tell the others. Everyone needs one place.'" — 6×**, and the stockpile
  outcome "Take half. You've got the hands for it." — 2×. Gossip closer
  "Take it for what it's worth." — 8×.

New sense nits (not pre-registered, documented not fixed):

- **Accept-then-back-out (2×):** Hassan (2303) and Magnus (2311) accept
  an invite ("All right. Let's go.") and the outcome immediately says
  "Maybe not today. The fire's got me." The acceptance is contradicted in
  the same beat — an accepted invite should lead to a walk, or the NPC
  shouldn't accept.
- **Stitched openings (2×):** Kai (2306) opens "Okay, but what about Can
  I tell you something? Before the scattering, I said something cruel." —
  two openers glued together. Ablade (2316) opens with two favours at once
  ("Never mind the pantry run... Water's almost gone — 0 liters...").
- Gert (2303) refers to himself in the third person ("Gert says I talk
  too much. Gert is right.") — reads as a quirk, harmless.
- The "one English they know" beat repeats across all four non-verbal
  convos ("Fuck you" twice, "Hello?", "Food?") — charming the first time,
  templated by the fourth.

## Reachable / fun / winnable

- **Reachable:** the ladder now pays for work villagers already do —
  cooking the daily meal, mending gear. A player watching their cook
  will see skill 1 arrive in the first week. Reachable by construction.
- **Fun:** the villages feel lived-in; the non-verbal convos and the
  party naming are the fun peaks. The repetition lines above are the
  drag — hearing the same dream sentence from the sixth villager is where
  the illusion thins.
- **Winnable:** this run doesn't move the win chain (no wave-5, no seat
  work) — it fills a rung the chain stands on: villagers who can cook and
  build are villagers who can keep a village fed and geared long enough to
  face wave 4. The ladder-wide pace03=1 (preserver racing to 3) is the
  next pace question, not this run's.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in the worktree: **293 passed, 7 failed** (786s, exit 1). Log
`evidence/2026-11-11/journey-establishment-r131-gate.log`. The 7
failing suites are r128's 6 (byte-identical profile) plus one load
timeout:
- measurement-proof-update + measurement-workflow — the staleness pair
  (proof inputs not current; the owed refresh, see below).
- mobile combat cadence (2 assertions), occupation panels (CLI workflow),
  phone frame proof (retained browser input stale) — standing.
- establishment-r20-fixes — standing: the racks-full voice test's
  "next day voices once more" expectation predates the rule-R reminder
  gate (2026-10-26), which only re-voices when the preserved-kcal figure
  changed; the test's static pantry never changes. Verified identical
  failure with the fix stashed (base tree) — not attributable to this run.
- capable-bot — TIMEOUT after 120s under load (load avg 9.34; all its
  assertions passed before the timeout). Feast/reactor content, untouched
  by the cook/mend grants. Load flake, not a regression.
**No lever-attributable failure. Gate adjudicated GO.**

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/establishment.json --current
'evidence/2026-11-11/journey-establishment-r131-before-seed*.json'
--metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,
c3.starvationDeaths` — **quiet (16 files, 4 metrics, no large
deviations)**. No LOUD lines at all, so the delegate regime change did
not move the guardrails; baseline rolled forward to the r131 BEFORE
panel (deaths 879, popAlive 155, pantryKcal 1,280,730, starvationDeaths
0; previous r128 baseline preserved as
`establishment.json.20261111-pre-r131.bak`, provenance label prepended).

## Measurement-proof refresh

Owed since r129. **Still owed.** `scripts/balance-proof-update.js`
takes a retained real observer-neutral panel as its argument — it
validates and installs one, it does not generate one — and no fresh
retained panel exists yet: sim-proofrefresh-b4's 16×150d panel is still
in flight (tree `sim-proofrefresh-b4` live, no panel in main-tree
evidence). Current `scripts/balance-proof.json` still points at the
Nov 10 panel (`evidence/2026-11-10/neutral-r172social-panel/panel.json.gz`).
Do not run a competing panel in this lane; the refresh completes when
sim-proofrefresh-b4 retains its panel.

## Closeout

- Commit: `bash scripts/safe-commit.sh` in the worktree (fix + driver +
  analyzer + proof test + prereg + evidence).
- Merge: re-check master hasn't moved; if it has, rebase onto the explicit
  master SHA, re-run proof tests, then `git merge --ff-only
  journey-establishment`; verify ancestor.
- Release + reap; rotation 1→2; delete the lock.
- Report: "merged locally, pending ship" — no version tag.
- Standing pre-flight deviation (LOUD): `git pull --ff-only` FAILED at
  run start — local master diverged from origin/master (ahead ~528,
  behind 156; same standing state as r120–r128/r130; ship loop owns
  reconciliation). Main tree clean; disk 38%.
- Registration incident: first registration killed by a runtime restart
  ~07:36Z (SIGTERM after ~24 min); no work lost; leftover branch + partial
  checkout removed before successful re-registration (~07:54Z).
- Heartbeat: the heartbeat script itself takes minutes per beat in this
  huge tree — heartbeat manually at key points too.