# Journey — social life r231 (Lane B, leg 5)

**Run:** Lane B occurrence 23:00 CST Nov 16, 2026 (run `loop2-20261117T045549Z`).
This run EXECUTES the r231 prereg finalized by the two blocked 21:00/22:00
CST occurrences (r231 never played until now — 21:00 blocked on the
worktree cap 16/16, 22:00 on registration timeouts under load). Base at
execution 7199f371f (master moved 2ac3052b0 → f7128f9f3 → 7199f371f since
the draft; companionguard shipped unconditional, nightcarry INCOMPLETE,
expignite DIAG GO, nationalsticky DIAG-NO-GO, rumortarget PILOT NO-GO —
none touch convoRecapLine; C3d fix shape stands).
**Leg question (prereg `evidence/2026-11-16/journey-social-life-r231-prereg.md`):** does social life hold up across a full run — invitations sometimes taken, bonds proposed and answered by character, moots firing, conversations reading as people, wants surviving across sittings without drying into the "...lost my train of thought" dead line — and do the r226 F6 fix and the r231 C3d fix hold in the wild?

## Registration (infrastructure)

- First attempt SUCCEEDED (foreground exec, 8.5 min): 11/16 active, 5
  slots free; reaper ran clean beforehand (67s, removed nothing — all 11
  active trees dirty, never auto-removed, owners must commit/release).
- Branch `journey2-sociallife` existed at 96d7d1d8b; ff-merged to local
  master 7199f371f inside the worktree. NOTE: the first ff attempt
  reported "Already up to date" while HEAD stayed at 96d7d1d8b — the ship
  loop was mid-push (version bump e60b8241e landed on origin during the
  fetch); resolved by verifying refs explicitly (origin/master
  e60b8241e is fully contained in local master 7199f371f — local is
  origin + 8 commits, no divergence) and ff-merging local master
  7199f371f directly.
- Lock `playtest-loop-2.lock`, run_id `loop2-20261117T045549Z`.
- Rotation-b read 5 at run start. This run plays 5 and writes 6 at closeout.
- WRITE FLAP hit 05:23–05:24Z: the pilot seed's JSON write failed with
  EPERM (`writeFileSync`, errno 1) and the first attempt died with empty
  logs; the watcher log confirms the window (05:23:36Z + 05:24:37Z both
  FAIL@write). Probe (`git update-ref refs/heads/probe HEAD` + temp
  write) passed at 05:25:15Z; pilot re-ran clean. No work lost — the sim
  is deterministic per seed, so the pilot was simply re-run. Flap still
  unproven as to cause (standing).

## Fix arm: C3d — recap-empty pool erases live threads

- **Defect (r229, second sighting):** seed 34312 d+53 Onni (trust 90):
  recap answered "We were just talking. Nothing important." while a LIVE
  favor ask (the creek-water run, stated in the opener, requirements just
  discussed) plus a party naming and a role assignment were on the table.
- **Mechanism:** `convoRecapLine` reads `c.threadLog`; the log was EMPTY
  — stated-but-unengaged wants plant no thread — so the empty-log branch
  served the recap-empty pool.
- **Fix:** new helper `convoRecapLiveLine(vid)` (`src/js/conversation.js`,
  before `convoRecapLine`); the empty-log branch checks the sitting's
  live want FIRST (stage 1–2, surfaced and unresolved) and names it
  through its stale opener (def's state-aware reframe, else
  `convoWantStaleOpener`). Pool only when nothing is open. Stage 0 is
  NOT live; stage 3 is resolved. The line flows through the recap's own
  repeat / press-cap guards. Diff +54/−16, one file.
- **Proof:** `scripts/test-journey-social-life-r231-c3d-recap-live-20261116.js`
  (godpath-lib pattern, real sittings, def via seed+select on a donor).
  - On fix: **35 passed, 0 failed.**
  - On base (fix reverted via `git checkout HEAD --` + restore from
    backup copy, no stash): **31 passed, 4 failed** — the 4 failures are
    exactly the two discriminator pairs (live ask_favor names the creek
    water run; live curious names the question). Cases 3–6 pass on base
    too (resolved / stage-0 / no-want / no-favor → pool), guards not
    discriminators.
  - Proof-test correction at execution: the case-1 assertion matched the
    favor short case-sensitively, but `ask_favor.staleOpener`
    capitalizes the sentence-initial short ("The creek water run — I
    haven't stopped thinking about it."). The assertion is now
    case-insensitive (same for the negative assertions in cases 3–4);
    discrimination re-verified with the final test file (base 31/4,
    fix 35/0). The fix returns the def's own voice verbatim — correct.
- **NOT fixed (filed as remainders):** repay.engageBeat broken/open pools
  (same class as F6, unobserved); all-3-blocked F5 residual (r226);
  the r231 dry-line residual below (new finding, fix design filed).

## Panel

Seeds 45705–45708, DAYCAP 140, policy journey. Driver
`scripts/journey-social-life-r231-20261116.js`, analyzer
`scripts/analyze-journey-social-r231-20261116.js`, helpers reused
`scripts/journey-social-r226-helpers.js`. Panel JSONs
`evidence/2026-11-16/journey-social-life-r231-4570{5..8}.json`, analysis
`journey-social-life-r231-analysis.txt` (817 lines). Panel ran on the
FIXED code (F6 + C3d native).

- 45705: d139 survived (alive 2). 45706: d135 survived (alive 8).
  45707: d131 village-lost (alive 0). 45708: d125 village-lost (alive 0).
- 570 conversations / 553 transcripts ≥4 lines; natural ends 529.
- **M1 GO** — plots 4; arms grievance-linked 4/4 by the reasons bar.
- **M2** — 131 villager-initiated proposals (person 61, link 70), 41
  accepted, 24 villager-person accepted, rate 0.247/village-day
  (anchors: r195 0.328, r200 0.177, r206 0.268, r215 0.235, r220 0.294,
  r226 0.272). maxPerInitiator 14 — the combined-cap design-look
  threshold (≥20) not reached.
- **M3** — sometimes taken: lure accept 417 / decline 347; party 32/7;
  bond 11/10.
- **M4** — candidates read as people (Wei + Yuki in the analysis; Raj
  d31/d32 below). 301 near-dup flags — the known template/requirement
  families (pantry-run ask variants, Haven-door favor-requirement
  variants, forage/creek instructions re-served as recap echoes); no
  same-beat flag in a goalFollow pool (the lead-pool fix holds).
- **M5** — 4/4 past d100.
- **M6 GO** (gate definition; strict on-tile away total 96 = the known
  metric/gate discrepancy, not a fail).
- **M7 HOLDS** (NARR-DUP verbatimRepeats 0).
- **M8 SETTLED** (3 settles, 3 linkFormed, 0 BLOCKED re-raises).
- **M9 HOLDS** (recap maxPresses 3, capFailures 0).
- **M10 HOLDS, FACE HOLDS.**
- **M11 GO** (recap-empty 0/301).
- **M12** — door-req flags 188/301 (34.0% of conversations,
  informational); **M12-native HOLDS** (threeTimes total 114,
  maxPerSitting 1, sittings2plus 0, exits 268).
- **Double-confession watch CLEAN** (CONFESS total 63, confessed 13,
  doubleSittings 0).
- Vendetta maxUnordered 1 (trend 7, 4, 2, 4, 1 — bar retired, watch only).
- Goal-thread offers: reactOffered 3419 (agree 0, joke 0, silence 3419 —
  same shape as r226; the react pool serves silence only), longest
  ContinuerRun 5.
- Moots fired on 3/4 villages (45705: 1, 45708: 2; 45706/45707: 0) — the
  0-moots watch does not trigger.
- Successions: 27 mantle passes panel-wide (45705: 8, 45706: 2, 45707: 8,
  45708: 9) — the bearer dies and the mantle passes repeatedly; 45705
  survived to d139 on its 8th bearer with 2 people left.
- Scattering 0/4.

## Job-B transcript reads (my own greps over the 4 panel JSONs)

- **F6 WILD HOLD — NO-GO (bar 0, result 4).** 4 dry-line drops panel-wide
  (r226: 21). Progress 21→4, but the bar is 0 and the residual is a NEW
  site, not the F6 sites. See "DRY2 — the finding" below.
- **F5 WILD CHECK — thin but real.** Settled-favor variants served once
  (variant 2: "It's taken care of, I swear..." — 1 serving; r226 had 8
  servings 2/3/3). Served honestly, not dry. The re-ask fires rarely.
- **F1 GO** — 3 "has an edge today" hits, all legitimate NARR mood beats
  ("Rafael/Henry/Sam has an edge today — something curdled."), 0 resume
  openers quoting a drift-note stage direction.
- **F3 — still unproven in the wild.** 3 "refus" hits are the NPC's own
  words ("I refuse to let that be true", "History isn't what happened.
  It's what we refuse to let go of. I refuse.") — no refused-bond
  resurface. Watch, not a fail (same as r220/r226).
- **B5 — per-funeral split INSTRUMENTED, first real read.** 18 funerals:
  full 14, partial 4, none 0 (lines 20; stats funerals 6/2/4/6,
  linksMended 18/8/6/16, kcal 26848/12000/7170/23402). Lines voice true
  kcal + outcome; the partial voice is honest (45705 d136 Hannah:
  "1,348 kcal from the pantry feeds Ashford — ... (Trust +7 — the feast
  could not buy back the full -8.)"). B5 GO.
- **B6 — direct count INSTRUMENTED, first real read.** 542
  want-resolution rows; stage-3-'deflected'-from-stage-0 = 0 (bar 0).
  byKind: ask_favor engage 219 / deflect 62 / commit 2 / stated 2;
  curious engage 112 / deflect 32; warn_you engage 15 / commit 1
  (HEED: 15 engagements, 1 heeded); seek_comfort engage 28 / deflect 17
  / commit 10; seek_taken engage 3 / deflect 9 / commit 1;
  just_company engage 5; share_news engage 24. B6 GO — stage 0 is not
  live, now proven directly, not by proxy.

## DRY2 — the finding: 4 dry servings at a new site (F6 residual)

By seed: 45706: 3, 45708: 1. All four are the dry line "...Sorry, lost
my train of thought." The F6 fix holds at its three sites; the residual
is the same defect class one layer out — `sayLine` handed a line with no
`convoWouldBlock` check, or a generic fallback served as a ledgerable
primary.

**Site 1 — dlg:doubt stonewall hole (convo-dialogue.js), 2 of 4.**
Raj Patel, 45706 d31 + d32: the player pressed "That doesn't quite
add up." 7× in the d30 sitting (the driver hammers the probe while a
doubt is open). The r192 probe fix picks the first non-blocked variant
from the prod-branch pool, else the stonewall ("They shake their head —
not no, not yes. Done talking about it."). The stonewall fired twice on
d30 — served as the PRIMARY line, so it was LEDGERED. On d31/d32 the
first probe press of the sitting found all branch-3 variants blocked
AND the stonewall run-blocked, and `sayLine`'s run-block branch serves
the dry line, ignoring `opts.fallback`. The fallback is only honored for
self-blocks; run-blocks always dry. The conversation then continues
fine (recap works, the confront lands) — the dry is a single dead beat,
not a broken sitting.

**Site 2 — confront result (truth.js), 1 of 4.** gen_o1jb3sv, 45708:
"You said something odd the other day. Let's talk about it." → the
confront handler calls `this.sayLine(vid, r.line)` with NO WouldBlock
check and NO fallback. If `r.line` is run-ledger-blocked, it dries.

**Site 3 — neighbors topic reply, 1 of 4.** Raj Patel, 45706 d132
(C-friendship): "How are we with the neighbors, honestly?" → the
topic-ask reply line was run-blocked and dried. Exact handler not yet
traced (topic-ask reply path, convoTopics/ask handler).

**Fix design (filed for the next social run, same F6 pattern):**
(1) probe handler: when all variants are blocked, serve the stonewall
ledger-exempt (e.g. `sayLine(vid, stonewall, { structural: true })` —
fallbacks are "deliberately EXEMPT from the ledgers (generic by design)"
per sayLine's own comment; a stonewall served as primary violates that)
or cap probe presses per sitting like the recap cap; (2) confront
handler: WouldBlock-check `r.line` before sayLine, fall to a fresh
phrasing; (3) trace + guard the neighbors topic-reply path. Proof
shape: godpath-lib, poison the run ledger with the stonewall via
ANOTHER villager's sitting, then press dlg:doubt on a test villager
with all variants blocked — dries on base, stonewalls on fix; plus a
confirm re-run on worst seed 45706 (expect 0 dry).

## Village assessment (plain words)

Four villages, two lived, two died out — and the social fabric held in
all four. 131 times a villager started a bond proposal on their own
(61 of them person-to-person, not village links), 41 accepted; moots
fired, funerals were held and honestly mended, successions passed the
mantle 27 times without the villages falling apart socially. The two
that died (45707 at day 131, 45708 at day 125, nobody left) died the
usual way — the wild, monsters, dehydration, wounds that wouldn't
close — not starving at home, not scattered, not silent. The two that
lived split: 45706 is the healthy village (8 alive, trust 70–100,
only 4 dead all run — Petra, Maya and Benoit at trust 100, Raj the
pharmacist at 99), while 45705 survived to day 139 as a two-person
remnant (James the carpenter and Rafael the roofer, trust 71 and 91)
after 16 deaths and 8 mantle passes. What was missing on the worst
seeds wasn't friends or talk — it was bodies: 45707 lost 18 people,
45708 lost 22, and by the end there was nobody left to talk to. The
one social crack in the panel is the dry line: four times a villager
started to answer — a probe, a confrontation, a question about the
neighbors — and the game answered with a shrug. Traced, filed, not yet
fixed.

## People check

Read in the panel analysis and the probe: villagers propose, refuse by
character, remember what they owe, grieve out loud. Wei (45705) asks to
talk because "I don't want to be alone with my head right now" — a real
want, engaged honestly, the recap re-anchoring correctly ("Still on
that hard time"), the neighbors answer naming real history (Haven acted
6, 28 and 42 days back). Yuki (45707) teaches a skill on a walk, dreams
of the dead Elijah, and when confronted about a theft answers straight:
"Yeah, I took 1× Stone. What are you going to do about it?" — then
accepts the party invite on the second ask. Raj's d31 sitting shows the
full arc in one conversation: a teach want, a probe, a dry beat, a
recap, a confrontation that lands ("I don't actually want to survive,
whatever it takes. I want to belong somewhere."), and a party naming.
The dry line is the one place they stop sounding like people — a
villager going blank mid-answer, three times for the same Raj Patel.
One template stem repeats ("You want to know about that? Okay." twice
in Wei's sitting before two different answers) — a wart, not a fail.

## Verdicts

- **Reachable:** the leg's content fires across full runs (moots, proposals, successions, funerals, confrontations all observed on fresh seeds).
- **Fun:** the social fabric reads as people — except where the dry line cuts a thread (4 servings, traced to three sites, fix design filed).
- **Winnable:** not this leg's question (social life is a full-run leg; the win chain is tracked by the endgame leg). No win movement claimed.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: **334 passed, 6 failed in 790s** (log:
`evidence/2026-11-16/journey-social-life-r231-check-quick.log`). All 6
match the known standing set, **0 attributable** to the C3d fix:

- measurement-proof staleness pair (2) — standing.
- phone-frame-proof stale receipt (1) — standing.
- ladder-bundle ambient-raid control (1) — standing ("200 monster turns
  WITHOUT delivery fire the ambient raid — fires 0").
- Exact-120s timeouts (2): living-garden, one-person-army — standalone
  re-runs green: living-garden **8/8**, one-person-army **7/7** (logs
  `journey-social-life-r231-livinggarden-standalone.log` /
  `...-onepersonarmy-standalone.log`).
- No cache-flags failure this run; no capable-bot / occupation-panels
  timeouts (r226 had all four timeouts + a cache-flags 1/4).

## Metric review

- **C3d PROOF:** green on fix (35/35), red on base (31/4) — the discriminator assertions are exactly the two live-want cases. The proof-test case-sensitivity correction (staleOpener capitalizes the sentence-initial short) preserves the discrimination; re-verified with the final test file.
- **F6 WILD HOLD:** NO-GO — 4 dry servings panel-wide against a bar of 0 (r226: 21). The metric is not wrong; the F6 fix holds at its three sites and the residual is a new site (DRY2). The bar stands for the next run; the fix design is filed above.
- **M1–M12:** same bars as r226. M1 GO, M2 rate 0.247 (in the anchor band), M3 sometimes-taken, M4 human-read (flags are template/requirement families), M5 4/4 past d100, M6 GO (gate def; strict away 96 = known discrepancy), M7/M9/M10/FACE hold, M8 SETTLED, M11 GO (0/301), M12 informational (188/301) + M12-native HOLDS.
- **B5:** per-funeral split instrumented — 18 funerals, 14 full / 4 partial / 0 none. The instrument works; the split is a real read now.
- **B6:** want-resolution rows instrumented — 542 rows, deflected-from-stage-0 = 0. The direct count replaces the r226 resurface proxy.
- **F5:** 1 settled-favor serving (thin, not vacuous). If the next panel is thin again, the targeted harness from the r229 metric review is owed.
- Determinism proof for the new driver wraps: seed 45705 re-run to a scratch OUTDIR, JSONs identical except the `ms` timing field — the wraps add no RNG and mutate no state.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json --current 'evidence/2026-11-16/journey-social-life-r231-4570*.json' --metrics l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos,dryRate,l2prime.count` — 6 LOUD lines, all `disappeared: baseline N -> current 0` on the l3.* / l2prime.* keys. Verdict: KNOWN SCHEMA DRIFT, not a bug — the social baseline is stale-era (pre-r51 keys the driver never emits); the panel's own analyzer measured the same quantities directly (end bonds 88/63/87/119, betrayal cases in darkEnd, moots 3, dry servings 4). Baseline NOT rolled (per prereg stretch-note: the re-seed with a metric mapping for the current social schema stays deferred). dryRate did not flag (no dryRate field in either schema — the F6 NO-GO above is the binding dry read).

## Closeout (adoption, main session)

- The 23:00 occurrence hit its 1h cron cap before closeout; the
  coordinator died with the work done but uncommitted. Adopted in the
  main session Nov 17 ~00:05 CST: the run note was complete except
  this section; the fix, panel, gate, and telemetry were all verified
  from the worktree's own logs and files before landing.
- Adoption verification: C3d fix diff is exactly `conversation.js`
  +54/−16 (the `convoRecapLiveLine` helper + the empty-log branch
  change); proof re-run by the adoption coordinator on the fix tip:
  **35 passed, 0 failed, exit 0**; gate log re-read from the
  worktree — **334 passed, 6 failed in 790s**, all 6 the standing set
  (measurement-proof staleness pair, phone-frame stale receipt,
  ladder-bundle ambient-raid control, living-garden + one-person-army
  120s timeouts with green standalone logs 8/8 and 7/7), **0
  attributable**; telemetry 6 LOUD lines adjudicated schema drift
  (stale-era baseline keys), baseline NOT rolled.
- Fix commit [needs-eyes] (dialogue-feel change — what the recap says
  when a live want is open), evidence commit separate; index clobber
  struck (repaired via ls-tree pipe, status verified clean). Rebased
  onto current master (the ship's version-bump commit), proof re-run
  35/35 on the rebased tip, ff-merged.
- **Merged locally, pending ship.** Rotation-b 5 → 6 written with
  read-back. Lock deleted after run_id verification
  (`loop2-20261117T045549Z`).
