# sim-coverage-tier2-round-1015 — Loop A 1015Z coordinator evidence (Coverage Tier 2 — STALE-LOCK RECOVERY + ADOPTION, 3 arms LANDED, merged locally pending ship)

Run fleshout-20261111T1015Z, axis coverage Tier 2 first numbers — conversations / trust-gossip / abilities-XP (scale-onramp converging, NOT converged; directive stands). Claim fleshout-20261111T1015Z written before any sims.

## Run-start closeout (stale-lock recovery)

STALE-LOCK RECOVERY: deleted the 0815Z lock (created 08:17:04Z; convfirst/trustfirst tree heartbeats 08:19/08:31Z, ~2h stale; no sim processes; lock >90 min old). The 0815Z run died mid-flight with all three arms part-done; this run adopted all three. Loop B LIVE on its 0835Z claim (proofrefresh-b4-adopt + vetfirst + dutyfirst) — NOT touched. Master moved under the run (Loop B vetfirst landed fd94c76e1–071df74d5; journey-social-life r179 4b89a8c73) — zero file overlap with any arm.

CORRECTION TO THE MAIN-SESSION ADOPTION NOTE: the note (evidence/2026-11-11/ADOPTION-0815Z.md, ~10:20Z) says trustfirst "produced nothing" and should be "restarted fresh". That is WRONG — verified from git: trustfirst held 2 commits (e5484ed6a 09:17Z prereg+instrument 38/38, 4dd9ab533 10:11Z GO pilot evidence), tree clean. Arm 2 verified and landed the committed GO arm; no fresh restart. The note's convfirst items were accurate (1 commit + uncommitted v2 diff + v1 corpus; proof 17/17 re-verified by the note).

Pre-flight: main tree clean, disk 39%, writes probe OK (EPERM flap clear at 10:24Z — quiet all run after that), reap ran clean (no removals; LOUD lines on other owners' uncommitted trees incl. stranded sim-wideduty-a + sim-sametick-a, left alone). Worktree registration timed out once at 180s (script's internal reap is slow under sibling load, ~80s+); retry with a 600s timeout registered clean (exit 0). Active 14/16 at claim, 9/16 at closeout.

## Arm 1 — sim-convfirst-a-adopt (conversations first numbers) — GO, LANDED a61f2c0a6

Branch sim-convfirst-a, 5 commits on master a61f2c0a6 (proof 19/19 green on merged master):
- 0181520fd — 0815Z worker's prereg + instrument/driver/analyzer/proof, adopted as-is
- eab3d77bf — v2 instrument + analyzer (PlayerDeath purge wrap, classification fix)
- 5d6d98e99 — wall survivors count runDays 'survived' endReason (was 'horizon', never fired)
- 155944245 — v1 pilot corpus (invalid round, retained) + 0815Z adoption note
- a61f2c0a6 — pilot 2 corpus (16 files) + summary + evidence (GO)

The purge wrap: `playerDeath` (ledger.js) deletes the successor's own talk request with no event record (r133). The instrument wraps `Game.playerDeath` with a pre/post fingerprint diff; the analyzer classifies those as fate `purged`. Proof grew 17 → 19/19 (new fixture + live test: real death, exactly one purge event, kind `successor-self`).

Pilot 2 (seeds 190201–190208, 150d, competent, flag OFF): GO — all 6 pre-registered checks pass: 0 unclassified opens, 0 unclassified turns, 0 unclassified sources / 0 unknown fates, neutrality 8/8 exact, 0 instrument errors, 893 opens (floor ≥5). Opens 893, all via `talkRound`, all ended `left`, 0 exchanges. Turns 0 — 262 question-bearing opens, 0 answers; villagers ask, the scholar walks out on every one. Requests 360 (villagerInitiative 193, linkRaise 115, bondProposal 24, invitation 20, betrayal-day1 8); fates delivered 88, expired 210, superseded 53, purged 6, pending-at-end 3, unknown 0. Bonds/links never decided: 24 bond proposals and 115 link raises, 0 decided — while villagers decide 26 bonds among themselves. Secret opens 32, confessed 32.

Wall (pilot 2): wins 0/8, national 0, table 0, wave-4 7/8, wave-5 3/8, median survival 120d, 1/8 survived to horizon. Evidence: evidence/2026-11-11/sim-convfirst-a.md. One finding appended to the backlog (scholar-directed bond/link proposals never decided — second sighting of the trustfirst link finding, now with the bond side + NPC–NPC contrast).

Process deviation (disclosed by the worker, verified by the coordinator): for two doc-only one-line fixes to the evidence file the worker used bare `git add` + `git commit --amend` on its own unmerged tip instead of routing through safe-commit.sh. The resulting commits were verified (file counts, clean tree, proof re-run green on merged master). No other bare git writes were made. Noted here, not repeated.

## Arm 2 — sim-trustfirst-a-land (trust/gossip first numbers) — GO, LANDED 27e94202c + addendum 194f0eb6e

Branch sim-trustfirst-a, 2 commits (826453000 prereg+instrument, 27e94202c GO pilot evidence), rebased onto explicit master SHA 071df74d5 (read fresh; first attempt briefly landed on the just-superseded 2ffa6c482 and was re-done). Proof 38/38 green pre- and post-rebase and on merged master. Rebase stop-at-pick quirk struck once (pick in both done and todo, tree clean, evidence files absent = unapplied); recovered with `git rebase --continue` per the documented procedure.

Evidence vs corpus verification (worker, re-checked by coordinator via the committed files): analyzer re-run on the raw corpus, re-derived summary byte-identical to the committed one. Every per-seed row, band total, GO row, and wall number checks out.

Pilot (seeds 190211–190218, 150d, competent, 1,150 village-days): GO — all 8 pre-registered rows pass. Trust writes 10,246 (0 unclassified); gossip seeds 10,481, spread hops 41,639, items reaching a second hearer 3,650 (max 12 hearers); reputation moves 29,769 applyRep, 13,316 real changes — 9,419 from gossip vs 3,856 from seeing it yourself. Villagers end at mean trust 63–77 per seed; 11–17 of 13–20 friendly or better. Village opinion (other villages' trust of you): 0 on every village, every day, every seed — it never moves. Bonds between villagers: 33 resolved immediately (17 accepted, 16 refused) plus 32 staged (31 expired, 1 pending). Moots: 43 reached quorum; the scholar's vote never landed, so 0 moot trust moves. Talk: 1,079 sittings, all zero-exchange, stipend +0 every time.

Wall: wins 0/8, national 0/8, table unmeasured in this shape (reported as such, not 0), wave-4 8/8, wave-5 3/8, median survival 133d, survivors 2/8, deaths 651, standing median 199. Evidence: evidence/2026-11-11/sim-trustfirst-a.md. 8 findings appended to the backlog.

DISCREPANCY FOUND AND FIXED (worker-reported, coordinator addendum 194f0eb6e): the evidence file's link-raise counts were wrong — it said "Link-raise ideas staged 172, expired 170" and "Bonds: 33 proposed". The engine's own `bond_proposed` tele payloads split by kind: link-kind staged 140 / expired 139 / accepted 0 / 1 pending; person-kind (bond proposals) staged 32 / expired 31 / 1 pending. The author had summed both kinds. The qualitative finding stands (no link raise ever accepted); the counts overstated link raises by 32/31 and the bonds line omitted 32 staged bond proposals (65 distinct bond proposals total, not 33). No GO row depends on these counts, so the GO verdict is unaffected. The addendum corrects the headline, the Bonds section, the Link-raises section, the sense verdict, and the findings line in the evidence file. The wrong numbers never reached the backlog (verified: no "172" line in sim-findings.md before the append; the appended line carries the corrected 140/139).

## Arm 3 — sim-abilityfirst-a (abilities/XP first numbers) — GO, LANDED 5bd89585b

Branch sim-abilityfirst-a, 3 commits (b259a4baf prereg+instrument, fc73b4a6d evidence+summary, 5bd89585b per-seed corpus), rebased onto explicit master SHA a61f2c0a6. Proof 43/43 green pre-commit, post-rebase, and on merged master. Fresh band verified (seeds 190221–190228).

Pilot (150d, competent, 851 village-days): GO — 0 unclassified XP events (7,031), 0 unattributed grants (snapshot residue 0 both sides), 0 unclassified presses (811), 18/19 wraps live (keepAbilities dead-in-pilot, proven live in fixture), neutrality 8/8 exact, 0 instrument errors, engagement floor 7,031.

Headline: XP 7,031 events, 8,132 XP — villagers earn 77% (6,239), scholar 23% (1,893). Field dominates (3,202 XP); discovery is 28% of deed credits; deed caps bind on 14%. Grants: 83 scholar picks granted, 31 refused (all full-slot retries — echo_location retried 9 straight days), 0 keeps; 169 villager grants, all magic lane; 713 villager skills. First-ability-magic check PASSES (Translator/Green Thumb/Survivor, all arrival gifts, day 8). Slot ladder completes day 12–25 on every seed (integration 100, 8/8) — an opening beat, not a climb. Synergies: scholar unlocks 1 in 851 days while villagers discover them constantly by the 12-day paired-use path. Use: scholar casts only 5 distinct abilities in 811 presses (rage 350, war_cry 181, green_thumb 164, green_whisper 110, pocket_sand 6); villagers fire 36/804 ability checks; only 6 villagers in 8 seeds hold any combat ability at end. Ghost practice: 429/1,414 gainAbilityXP calls (30%) credit nothing — gardening calls green_thumb unconditionally (358), giving food calls generous (70); resonance still accrues. Channeling: 557 surge armings vs 45 practice sessions. Mantle churn: 74 transitions, 88 scholar deaths — final bearers hold 1–6 abilities with near-zero tracks; no final bearer holds any passive despite 68 unlocks.

Wall: wins 0/8, national 0/8, table unmeasured in this shape (reported as such), wave-5 3/8, wave-4 7/8, median survival 116d, 630 deaths. Evidence: evidence/2026-11-11/sim-abilityfirst-a.md. 14 findings appended to the backlog. Caveats (worker's metric review): the dinner-skip question and the "casts vs unknown monsters" half of metric 5 are unmeasured, not zero; the say corpus covers `Game.say` only, not `sysSay` (level-up sheet lines missed).

## Wall (this run's judged corpora, 24 seeds, 3 bands)

Wins 0/24, national 0/24, table 0 measured / unmeasured in two shapes, wave-5 reached 9/24, wave-4 reached 22/24, median survival 116–133d per band. The scale wall stands: the 199 standing gate reproduced on the trustfirst band (median 199, regional on all 8 seeds); the veteran bar remains the wave-5 choke (Loop B vetfirst, landed today, decomposes it further).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline <scale-wall.json> --current '<per-seed-glob>' --metrics national,table,wins,exiled` on all three corpora. The script REFUSES all three: "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here." No LOUD lines, no investigation item. Baseline NOT rolled — correct: these are first-numbers census corpora, not win-seeking runs, and the baseline is a WINSEAT-regime baseline. Same refusal class as the 0615Z run.

## Metric review (§14)

Each arm pre-registered instrument validity (first-numbers census) and was judged only against its header: convfirst 6/6, trustfirst 8/8, abilityfirst 7/7 — all GO. No metric was re-scored mid-run. Revisions proposed for the NEXT run, not this one: (1) abilityfirst — measure the dinner-skip question and casts-vs-unknown-monsters, and extend the say corpus to `sysSay`; (2) convfirst — `'delivered'` ≠ proposal settled (a delivered bond/link proposal is still undecided), 2 unlinked tele stagings, early-game-only sense corpus, unmeasured requester-died fate; (3) trustfirst — table reach needs a shape that carries a table-offer field. The three GO verdicts are instrument-validity verdicts: the instruments are proven, the numbers are first numbers, no confirm band was spent.

## Infrastructure

- Safe-commit index clobber hit the trustfirst addendum (MM variant — repaired via cacheinfo, hashes verified), all three convfirst safe-commit.sh commits, and all three abilityfirst commits. Commits always correct; main tree clean at closeout.
- Rebase stop-at-pick quirk hit the trustfirst worker once and the convfirst worker twice; recovered with `git rebase --continue` after verifying unapplied each time.
- check.js --quick NOT re-run: zero src/js in all three arms (scripts + evidence only); standing 294/6 pre-existing profile recorded by the 0230Z run and re-recorded by journey-succession r177 hours earlier.
- The abilityfirst worker's recorded subprocess list shows one SIGTERM kill (a hung subprocess cleaned up by the worker); the arm completed green afterwards and the coordinator verified the branch independently before merging.

## Tracker state

scale-onramp stays converging (NOT converged): wins still 0 everywhere, national 0, table 0; the 199 gate reproduced once more and the veteran bar remains the wave-5 choke. food-economy stays converging (untouched; sibling B loop). Coverage Tier 2: conversations [x], trust/gossip [x], abilities/XP [x] — measured this run. Loop B live on veterans [ ] / duties [ ] (0835Z claim) — NOT touched, NOT marked. Next blanks, in order: (1) justice/moot first numbers (next unchecked Tier 2 item); (2) titans/heralds; (3) relay/network; (4) kin/naming/childbirth/keepsakes; (5) standing points; (6) siege (SUBSTRATE-MISSING — needs a design note first). Plus the standing 0615Z blanks: wave-5 facing measurement, fishing follow-ups, COUNTER_ANSWER default call, measurement-proof refresh (B's proofrefresh-b4 may cover it — check before claiming).

Claim deleted; lock deleted. Evidence: evidence/2026-11-11/sim-coverage-tier2-round-1015.md (coordinator evidence, this file).
