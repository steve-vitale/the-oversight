# Journey leg: DEEPENING (days 40–80) R108 — "DID THE FUNNEL MOVE ON THE NEW BASE, AND DOES THE REVISED P-KEEP RULE HOLD?" — 2026-11-06

## Pre-registration (written BEFORE any seed runs; no game-code fix pre-registered)

Rotation read 2 (deepening) at run start; r108 plays deepening, writes 2->3
at closeout WITH verified write + retry (r106/r107 rotation note: verified-by-read-back
writes stick; silent ones intermittently don't). Closeout re-verifies the lock
is still this run's and the rotation still reads 2 before touching either
(2026-11-06 AGENTS.md lesson: a later run may already have moved them).
Base: master cc4345e1e at worktree creation (master moved 8ee4aed6e ->
cc4345e1e, journey endgame r144 closeout, during this run's pre-flight).
Policy: competent (r105 driver lineage, VERBATIM — see below).
Seeds: fresh 92901–92904. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 92900 (outside the main band) x DAYCAP=45 proves the r108
driver before the main run; smoke outputs deleted after the check.

Freshness check for 92901–92904 (full check per the 2026-11-05 AGENTS.md
lesson — ALL dated preregs + all dated .md + evidence filenames +
forbidden-band lists, not just today's files): COMPLETED before the
panel ran. Boundary-aware seed-context patterns (`"seed": 9290x` /
`seed=9290x` / `SEEDS=…9290x` / `s9290x` across evidence/ + scripts/ +
docs/): 0 hits. Word-boundary .md mentions of 92901–92904 across
evidence/ + docs/: 0. Filename hits for 9290*: none. Band 928xx
REJECTED: named in evidence/2026-10-23/sim-storageshed-b6.md (used
92801–92816) — a used band is not fresh even with no corpus behind it
in this leg. 929xx is absent from the tendbelow forbidden list
(99001–99008, 99009–99024 contaminated, 99041–99052, 99101, 99201–99216,
99217–99232, 99401–99412, 99601–99612, 99701–99708, 99801–99808,
98701–98716, 89701–89707, 83601–83800, 16101–16116, 99901–99912).
Smoke seed 92900 cleared the same way (0 word-boundary .md hits, no
s92900 filenames). Band 92901–92904 verified fresh.

## The question (SURV-CONTROL-2, primary — the control on the NEW base)

r107 closed the variance question at 2/4 on base 792ab8814 (same as r105).
Since then master has gained combat-relevant landings: the pocket_sand
flee-order fix + raid-cooldown ship (build-smallfixes 3e82c17d1 /
8ee4aed6e), the staged-ally mechanism (stageally GO, winnability-round
0615), linkseek (GO). A flee-order change can move fight outcomes in
the deepening window (waves 2–3, ~52 fights a panel), so the funnel
needs a same-driver control on the new base before any claim is made
about it. This run IS that control: the r105 driver VERBATIM
(CONVO_DAYS [45, 60, 80], DAYCAP=100, competent policy) on the current
base with fresh seeds.

- **Verdict**: >=2/4 survive → funnel unchanged; the new landings did
  not move it. 0/4 survive → base moved; the next job is bisecting
  what changed since r107's base (no claim about which change until a
  bisect runs). 1/4 → ambiguous, no claim either way.
- **INTERESTING** if 0/4 (real drift — a regression to hunt) OR if
  >=2/4 with a different cause split than r107 (e.g. fight deaths
  down after the flee-order fix — descriptive, not a verdict on the
  fix, which is a build-smallfixes item, not this run's).
- The control is descriptive about WHY villages die (fight-heavy vs
  starvation, pantry at death, wave reached) exactly as r105/r106/r107
  reported it — a cause split, not a winnability verdict (fresh seeds,
  small panel).

## Secondary (P-KEEP-REVISED — adopt r107's metric-review revision)

r107's metric review proposed: NAMED-STRUCTURAL requires a repay-opener
line in the later sitting's THEM lines, not just a `want: repay` line
(Maeve's day-60 sitting proved the want can be selected without the
promise ever surfacing). This run ADOPTS that revision. The repay-opener
vocabulary is verified in src/js/convo-wants.js (fresh opener cycle:
"I've been thinking about what you promised. I don't like owing
kindness." / "About last time — I haven't forgotten what you said
you'd do. I want to return it."; favor-aware branches: "About {short}
— have you had a chance?", "You came through on {short}. I won't
forget it.", "You said you'd help with {short}. ...It's done now.
Forget it."; stale openers: "About {short} — I keep thinking about
what you did.", "About {short} — I keep turning it over.", "About
{short} — still on my mind. Have you had a chance?", "{Cap} — I keep
coming back to it. Any chance yet?", "{Cap} — I still owe you the
thanks."). The old want-only rule is still computed and reported
alongside for continuity (structHitOld). Verdict counts NAMED +
NAMED-STRUCTURAL-revised.

- **INTERESTING** if any thread the old rule called NAMED-STRUCTURAL
  scores SILENT under the revised rule (Maeve-class over-count
  confirmed on fresh seeds), or if a revised-structural hit appears
  (a repay opener surfacing without a regex hit — would show the
  promise regex misses a variant).
- The analyzer change is tooling only (scripts/analyze-journey-
  deepening-r108-20261106.js); no game code changes. The proof test
  (scripts/test-journey-deepening-r108-pkeep-20261106.js) covers the
  revised classification on synthetic transcripts: (a) Maeve-class
  (want=repay, no promise-naming THEM line) scores SILENT revised /
  NAMED-STRUCTURAL old; (b) a repay-opener THEM line with want=repay
  scores NAMED via the regex; (c) a repay-opener line the regex misses
  ("You came through on the food I needed." with no second sentence)
  scores NAMED-STRUCTURAL revised; (d) a plain NAMED case still scores
  NAMED; (e) no-later-sitting still scores NO-LATER-SITTING.

## Watch item (RAJ-PHOTO — curious-plant abandonment, descriptive only)

r107's Raj thread (92603 day 80): a curious opener plants a real thread
("I'm keeping a photo of someone I left behind. I haven't told anyone.")
and a decline kills it without a trace — the sitting ends
resolution=unestablished and no later sitting returns to the photo.
This panel counts curious-opener sittings that end in a betrayal
decline with an unestablished resolution (CURIOUS-PLANT), and for each
whether a later sitting with the same villager exists (testable) and
whether any later THEM line returns to the planted content (photo /
left behind / that photo). Descriptive only — no verdict, no fix. A
fix follows ONLY if the pattern reproduces AND it is a clear ledger
defect with a proof test, disclosed as post-panel, not pre-registered.
The design question (should a declined invitation preserve the
sitting's want thread?) stays Steve's call.

## Carried context (reported, not re-judged)

- D-THING (r107 closed as a blank; carried as continuity): same scan,
  testable denominator (testable only when a later sitting with the
  same villager exists).
- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — nothing in this run touches bonds.
  build-bond-initiate is still NOT merged (branch exists, no merge
  commit); this run does not build it and does not touch it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r107: 0). Any senseless sitting is read and named,
  not just counted.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r107.
- S-TRACE (carried): standing-trace verdict, same scan as r107.
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window.
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — the control's cause split (see above).

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is
  a builder brief, not a tweak; build-bond-initiate owns it in
  another worktree.
- Does not change succession release, seed priority, or the
  question-first-openings design question (Steve's call, not a tweak).
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.
- Does not touch win prices, deed gates, or any balance number.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
