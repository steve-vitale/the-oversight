# Journey succession r294 — Lane B, leg 7 (succession) ADOPTION — EVIDENCE

Run lineage: r291 (1855Z play + 2200Z adoption + 2300Z adoption: 26-seed
panel, mourning-above-naming fix `07906b8ca`, tooling `ff06c3199`, postfix
panel launched 23:16Z, check.js launched 23:23Z) → r292 (0000Z adoption:
died ~00:21Z) → r293 (0100Z adoption: machine restart 01:09Z, panel +
check relaunched, check adjudicated, gate batch launched 01:44Z) →
this run (0300Z adoption: stale-lock recovery, panel + gate read,
verdict, merge).

- Prereg: r291's `journey-succession-r291-prereg.md` (frozen before any
  judged sim; seeds FRESH band 34590–34613, EARLY_KILL_DAY=40,
  POST_DAYS=70, + positive control 34403 + smoke 33998).
- Rotation-b reads 7 (succession); advances 7 → 4 on this landed run.
- Worktree `~/workspace/worktrees/journey2-7`, branch `journey2-7`.
- Commits adopted (NOT on master yet): `07906b8ca` (fix + proof +
  postfix runner), `ff06c3199` (panel tooling). Evidence corpus +
  r291/r292/r293/r294 notes committed this run (see closeout).
- Main tree verified CLEAN at ~02:56Z (`git status --short`, empty).
  Disk 54%.

## Stale-lock recovery (this run)

Lock `playtest-loop-2-20261128T0100Z` (created 00:58:25Z) deleted after
the full check, same-call as its read: registry heartbeat for
journey2-7 was 01:45:00Z (71 min stale, >15 min), no live coordinator
process for this loop (`ps` shows only Lane A's journey-landing hbloop
+ flesh-out workers), no live subagent owned by
oversight-playtest-loop-2 (only a done r291 people-check worker), lock
118 min old (>90 min fallback). The 0100Z run died between its last
heartbeat (01:45Z) and ~02:00Z — its DETACHED r291fix panel survived
it and completed 02:25:35Z ("=== PANEL COMPLETE leg r291fix ===",
analyzer exit 0), as did the r293 gate batch (done 02:10:45Z, all 7
rc=0). Latest tree write 02:25:35Z (panel log). New lock
`playtest-loop-2-20261128T0300Z` created 02:58:55Z. Heartbeat landed
03:02:02Z, hbloop `journey2-7-hbloop-r294.sh` restarted (pid 131533).
Registry run_id still reads the stale `playtest-loop-2-20261127T1855Z`
(the heartbeat script updates heartbeat_at only); heartbeat is the
liveness signal and it is fresh.

## Gate adjudication — GREEN (read this run)

- r293 gate batch (`journey-succession-r293-gate-standalone.log`,
  done 02:10:45Z): all 7 check.js --quick timeouts pass standalone,
  rc=0 each — living-garden-deed-attainment, occupation-panels (25/25),
  one-person-army-deed-attainment, trust-observer-neutrality (6/6),
  synergy-stall, throttlefeast-20261014 (17/17), capable-bot-20261014
  (40/40). Load flakes, confirmed (ran concurrently with the panel
  right after a machine restart).
- measurement-cache-flags: 4/4 standalone in r293 (not re-run).
- 3 standing staleness (measurement-proof-update,
  measurement-workflow, phone-frame-proof): carried pre-existing per
  r287; branch was behind master, proof hashes stale. NOT caused by
  the fix; NOT re-adjudicated here. They clear when the branch is
  rebased onto current master — the rebase step re-runs the proofs.
- Full check picture: 333 passed / 11 failed → 7 timeouts (now PASS
  standalone) + 1 cache-flags (4/4) + 3 carried staleness. Gate GREEN.

## Post-fix panel verdicts (r291fix analyzer, fixed tip, 26 seeds + 2 controls)

| Bar | Verdict |
|---|---|
| DRY-CENSUS | PASS — 0 dry hits (16 honest fallbacks, 0 null-return silences) |
| MOURN-TEMPLATE | PASS — 184 servings, 0 same-speaker repeats, 0 village-window repeats |
| MOURN-EXHAUST | PASS — 0 exhausted-line servings in mourning sittings |
| REL-BOND | PASS — 7/7 held |
| REL-VETERAN | PASS — 29/29 held (81 opener draws in both-veteran convos) |
| MANTLE-FINE | PASS — 82 deaths, 0 latency ≥2, 0 day-skips |
| CAP-NC | PASS — bonded-by-deadline 7/7 eligible seeds |
| HABIT-COLLISION | PASS — 0 same-seed collisions (7 habit servings) |
| LATELY-DISPLACER (descriptive) | **0/3 naming-displaced (baseline 3/3)** — grief live at stage 0 |
| REL-WITNESS | **FAIL — 0 witness servings on 3 qualifying convos** (see below) |
| WITNESS-CENSUS | SUPPLY-PRESENT — 1 witnessed person corpse (34613 Dzigbordi, combat, Minh) |
| WIT-SIT | STAGED-UNREACHED — staged 4, fired 3, lately named the staged dead 3/3, witness-variant servings 0 |

## THE ANSWER — the fix works; the witness variant is a second, separate mechanism

The r291 fix (grief + mantle blocks above the naming debate in
`t2LatelyEvent`) does exactly what it claims, at panel scale:
latelyKind is mourning on 3/3 fired witness sittings (baseline: naming
3/3), the staged dead are named 3/3, naming displaced 0/3, and the
smoke control now mourns its dead by name (8 servings naming Heinrich,
baseline 0). Mwirigi's sitting proves the words land: "Since Devon
died... I keep expecting to see Devon at the fire. Stupid."

REL-WITNESS still FAILS — 0 witness-variant servings ("I was there
when X fell" / "I saw X go down") on the 3 qualifying sittings. The
mechanism is pinned, and it is NOT the naming displacement. Two
distinct causes, read in full from the three transcripts + the game
code (`t2MournRel`, `t2gen_lately` mourning pool) + the analyzer
(`relSnapFor` reads the game's own `t2MournRel`, so the witnessed flags
are game-side truth, not driver-side knowledge):

1. **Betrayal-case capture (2 of 3: Theo 34599 d+18, Grace 34604
   d+12).** All three witnessed deaths are ambushes, and an ambush
   opens an unsolved betrayal case. The sitting opens with the case
   line (`betrayal.js:4403` — "There's still the matter of the
   ambush of Onni/Jada. Nobody's settled it.") and the turns go to
   the investigation (site / witnesses / investigate / vote guilty).
   The mourning pool — witness variant included, and the game DID
   have it available (`latelyWitnessed=true` game-side) — never gets
   a turn, because the driver's picks (and a real player's picks)
   follow the open case. The dead are named, but as a case, not as
   grief. Theo asked "What did you see out there?" and got a herb
   lesson; Grace's sitting ran the confrontation loop three times
   ("You said something odd the other day") and closed "Good talk"
   with Jada never mourned. Same shape as the r291 baseline, one
   level deeper: grief now wins the lately slot, but the case wins
   the conversation.
2. **Draw odds (1 of 3: Mwirigi 34605 d+8).** The mourning pool DID
   serve with the witness variant in it (`rel.witnessed=true` in the
   snapshot; the variant is 2 of 7 lines in the single-name pool)
   and the one draw picked a generic line ("Since Devon died...").
   One draw at 2/7 missing is unremarkable probability — but it also
   shows the variant's supply: exactly ONE witnessed serving on the
   whole 26-seed panel (184 driven mourning servings, 1 witnessed).
   At that supply, the variant almost never fires by chance.

## Merge decision

MERGE the r291 fix. The fix's claim is the lately priority, and it is
proven three ways: proof test 4/4 (incl. RED on the unfixed tip),
LATELY-DISPLACER 0/3 at panel scale, and the smoke control mourning
by name. The REL-WITNESS FAIL is a verdict on the witness variant —
a separate mechanism (betrayal capture + draw odds) the fix never
claimed to touch — and it stands as FAIL, recorded here, not
re-scored, not hidden. Holding a proven fix hostage to a second
design question (below) would strand it through a fourth run; the
branch is already 9 commits behind master. The variant is the next
leg-7 blank, filed with its mechanism pinned — it needs its own
prereg, its own design call (does fresh grief outrank an open
betrayal case? should the first mourning serving of a witnessed death
be the witness line, or the variant weighted up?), and its own panel.
This run does not make that call inside an adoption.

## People check (coordinator's own full read — the 3 WIT transcripts)

- Mwirigi (34605 d+8): the fix working in the words. Fever first
  ("I'm achy and wrung out"), then asked "How are you holding up?
  About... them" — "Since Devon died... I keep expecting to see
  Devon at the fire. Stupid." Specific, embodied, Devon named. His
  pushback ("We've barely spoken. Ask me after we've bled together")
  is a person with a boundary. Closer "This was good" is earned here.
- Theo (34599 d+18): the dead named in the case line, then the
  sitting becomes a whodunit. "What did you see out there?" answered
  with a plant lesson — the exact failure the r291 people-check
  flagged, still present. The foraging ask ("Will you forage with me
  tomorrow?") is a real want, well-voiced; the smiling closer ("Come
  back anytime") after an unmourned ambush is not.
- Grace (34604 d+12): same shape, worse. Guilty vote counted, then
  the confrontation option offered three times in a row (filler
  loop; her escalating pushback — "I confessed that already. I'm
  not confessing it twice for dramatic effect" — is human, the
  option is not), then "Good talk. I feel like I know you a little
  better now" with Jada never mourned. The smiling closer after
  grief is still pasted everywhere — r291's next blank, still open.
- r291's other next blanks still open: mourning-template repetition
  (same syntax, name swapped), NPCs dropping their own wants (Theo
  never re-raises Onni, Grace never returns to thinking out loud).
  Filed, not built here.

## Village assessment (plain words — post-fix panel)

r291's assessment stands. The mantle still passes cleanly at every
death (82 deaths, same-day successor every time, no skipped days).
People still grieve by name (184 servings, no repeats), newcomers
are still taken in (7/7 bonded by deadline), villagers still form
bonds (110+ new) and ask each other to talk. The one change this
panel: the dead get named first now — the naming argument waits
until the grief passes, and in the smoke village Heinrich is mourned
by name eight times where before he was never mourned at all. The
remaining hole is narrower than r291's: a witness whose friend died
in an ambush still can't say "I saw them fall" — the village's
justice case talks over the grief, and when grief does get the turn,
the witness's own line is a 2-in-7 draw.

## Reachable / fun / winnable (leg 7)

- REACHABLE: yes, unchanged. Mantle passes cleanly; the successor's
  life is playable from the handoff.
- FUN: better. Mourning by name lands — the smoke village proves it
  in the control. The un-fun part that remains is the witness hole
  above: watching a death and then investigating it like a case,
  never saying what you saw.
- WINNABLE: unchanged. The leg is about the mantle passing, not the
  win.

## Metric review

- REL-WIT as written conflates two mechanisms: (a) the lately-kind
  priority — fixed by r291, proven 0/3 displaced; (b) the witness
  variant serving — blocked by betrayal capture and draw odds.
  Proposal for the NEXT succession run: split the bar. Judge (a) on
  LATELY-DISPLACER (binding, 0 displaced) and (b) on variant
  servings in sittings where the mourning pool actually gets a turn
  (exclude case-captured sittings from the denominator, or make the
  case yield a design question of its own). Do NOT re-score r291fix
  on this; the FAIL stands.
- WITNESS-CENSUS wording fix (r291): still owed — the census reads
  `corpse.witnesses` from corpses.js and reports 0 witnessed on
  34599/34604/34605, yet the game's own `t2MournRel` returned
  witnessed=true for all three speakers at sitting time. The census
  instrument reads the wrong field for staged deaths (end-of-run
  corpse list vs fresh-corpse witnesses at sitting time). The staged
  witSit record is the supply truth. Proposed: census counts
  witSit-staged witnesses as supply.
- Pilot-branch rule (r291 metric review): still unaddressed — the
  pilot seeds carried zero witness sittings; the staged supply lands
  later in the band. Next run: stage the supply screen so the pilot
  seeds carry a witness sitting, or drop the pilot branch for this
  question.

## Telemetry deviation check (step 14)

Ran on the r291fix tele corpus (26 files) vs
`telemetry-baselines/succession.json`. Two LOUD lines, both
EXPLAINED — baseline NOT rolled:

- `deaths.bearer <redacted> 979%: baseline 7.6 -> current 82` and
  `census.fallen swung 1110%: baseline 14.3 -> current 173`.
- Same cause as r291: the checker compares the baseline MEAN against
  the current SUM over the 26 files. On means: deaths.bearer 3.15
  (vs 7.6), census.fallen 6.65 (vs 14.3) — identical to r291's
  baseline-panel means (3.15 / 7.07). The fix changed no death or
  mantle shape; the band simply has fewer deaths and more survivors
  than the unprovenanced baseline. Per the prereg (forced-chain
  regime — do NOT roll on LOUD lines, per r280) the baseline stands.

## Incidents (this run)

- STALE-LOCK RECOVERY: see top. The 0100Z run died between 01:45Z
  and ~02:00Z; its detached panel + gate batch survived it and
  completed (02:25:35Z / 02:10:45Z). No work lost.
- REAPER SKIP: `worktree-reap.sh` skipped at pre-flight — "registry
  lock held by another reaper run (consecutive skips: 1)". Another
  loop's reaper held the lock; re-ran at closeout (see below).
- REGISTRY RUN_ID STALE: journey2-7's registry run_id still reads
  `playtest-loop-2-20261127T1855Z` (heartbeat script updates
  heartbeat_at only). Heartbeat is fresh (03:02:02Z+); noted, not
  repaired — registry writes are contended right now.
- hbloop exec drain-timeout on launch (child holds the pipe): the
  hbloop itself is running (pid 131533); no action.

## Closeout state (for the next Lane B run)

- MERGED locally, pending ship (see run log): journey2-7 rebased
  onto current master, r291 proof + carried proofs re-run on the
  rebased tip, `git merge --ff-only journey2-7`, tree released,
  rotation-b written 7 → 4, lock deleted.
- NEXT BLANKS (filed, leg 7, for a future succession run): (1)
  witness variant vs betrayal-case capture — does fresh grief
  outrank an open case, and should the first mourning serving of a
  witnessed death be the witness line? Needs its own prereg + panel.
  (2) Smiling closers after grief ("Good talk", "Come back
  anytime") — retire whenever grief is live. (3) Mourning-template
  repetition — each mourning villager their own sentence. (4) NPCs
  re-raising their own wants when the player changes subject.
  (5) "What did you see out there?" answered with what they saw,
  not a plant lesson. (6) WITNESS-CENSUS wording fix (above).
- Next run plays leg 4 (endgame) per rotation-b.
