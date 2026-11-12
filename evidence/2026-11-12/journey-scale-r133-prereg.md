# journey-scale r133 — PRE-REGISTER (lane A, leg 3 SCALE, trap-line answer)

**Run id:** `playtest-loop-a-20261112T1141Z` (lock run_id `2026-11-12T11:41:43Z`).
**Run:** scheduled Thu 2026-11-12 04:45 CST (10:45 UTC); this run 11:41Z–.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `ddb0a9101` (post-pull; `git pull --ff-only` "Already up
to date" at 11:46Z; master moved ce89f2b77 → ddb0a9101 under the run by the
ship loop before the pull — ff-only, clean).
**Worktree:** `journey-scale`, registered 11:51Z (flap probes 5/5 WRITE-OK
first; registration slow ~10 min under registry-lock contention — same
morning's standing condition). Heartbeat landed 11:59:56Z; hbloop
`journey-scale-hbloop-r133.sh` 10-min cadence.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. The fix below changes no demand, no number, no
bar: it offers a gesture answer to a mimed invitation that is already
shown. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning until the fight-play census lands. This run touches dialogue-menu
code only, so the gate does not bind it (same as r129/r130/r183/r132).
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for the
r131/r132-carried trap-line defect. It does not re-prove the veteran census
or the survival collapse (the Loop A/B bisect owns that).

## Standing context (read before scoring)

- **r132 scale (landed, adopted 2026-11-11):** raise-answer template fix
  (bond/link asks withheld until spoken); scale reachable 4/4 (regional
  links, ladder stage 3, lesser seat priced 4/4, tribute delivered 1/4),
  fun yes; winnable unchanged — 0/4 full seat, national never live; the
  living-veteran pair is still the wall. Band lived-days 497 (1 alive /
  3 dead). Vetbar guard GO (zero readiness/ladder disagreements).
- **r132 Q2-secondary carried (this run's Q1):** trap-line / mimed-invitation
  answering — fired twice now (Tarek r131, Mario r132, seed 132101 d120):
  the NPC mimes "come with me", the menu offers no way to answer, the
  invitation evaporates. Pinned locations: `conversation.js:8452-8468`
  (nvOpen gesture, `inv.spoken = true`), `conversation.js:4954-4975`
  (nonverbal menu: nv:nod/smile/pointself/listen/translate only),
  `conversation.js:8547+` (nv: turn router → nvRespond).
- **r132 Q2 carried (this run's Q2):** the `betrayal:accept` sibling
  pattern — `betrayal.js:4351-4360` offers `betrayal:accept`/`betrayal:decline`
  whenever a `pendingInvite` exists, with NO per-sitting spoken check.
  Fired: Thabo, seed 132103 d120 — turn-0 choices were
  betrayal:accept/decline while the driver's transcript file shows only
  the grief line ("I don't know what to do with my hands today."). The
  r132 note records "whether the invite was heard in a PRIOR sitting is
  unverified (the transcript instrument does not record invite staging /
  spoken history) — needs that history before a verdict."
- **Since r132's base (f888f7ce3), src/js changes landed:** r183 (place-lesson
  frame rotation — driver-only, no game change), r131 itself, the
  journey-social-life r181 adoption gate fill (master tip ddb0a9101),
  Loop B's synergy holdout + proofrefresh-b8 (measurement proof FRESH
  again — `test-measurement-proof-update.js` passes on this base per the
  0930Z Loop B evidence; the r132 staleness pair should read GREEN this
  run unless this run's own src touch re-stales it). Trajectories are NOT
  expected byte-identical to r132.
- **Loop A (flesh-out) is live on bisect round 6** (sim-bisect-r6-cut-a +
  sim-stallcut-a, active in the registry) — do not touch, do not pre-claim.

## Q1 (PRIMARY) — TRAP-LINE ANSWER: build the gesture accept/decline

**The defect (read in code + transcripts this run, not just inferred).**
Mario, seed 132101 d120 (r132 band): Italian, no shared words. The NPC
mimes toward "the cache spot" (`nvOpen`: "(They mime walking — pointing
at themselves, then at you, then toward the cache spot. The meaning is
unmistakable: come with me.)", `inv.spoken = true`). The menu offers only
gestures; the policy nods 4 times and leaves. The invitation evaporates.

**Mechanism (read in code this run).** Three links, all verified:
1. `nvOpen` (`conversation.js:8452-8468`) SHOWS the mime and sets
   `inv.spoken = true` — but the gesture goes through `this.say()` +
   a transcript push, never through `sayLine` with tag `'invitation'`.
2. `betrayalChoices` (`betrayal.js:4351-4360`) DOES prepend
   `betrayal:accept`/`betrayal:decline` whenever a pending invite exists
   (the no-shared-words gate below it returns the list WITH them).
3. `convoMenuPage` (`conversation.js:4632` + the `else if` strip at
   ~4650) strips `betrayal:accept`/`betrayal:decline` whenever no owns
   rule fires and `c.spokenBeat?.tag !== 'invitation'` — and the gesture
   never sets that tag. So the accept/decline are offered by one layer
   and removed by the next. The mime is shown and unanswerable.
Canon (`docs/CONVERSATIONS.md:104`): "Replies belong to the spoken
exchange. A question, invitation, price or live request owns its
decision menu." And (:142): "No shared language → the conversation is
nonverbal (gesture choices with varying outcomes)."

**The fix (one task, one commit).** Gesture answers, in the nonverbal
menu, gated on the mime having been shown this sitting:
1. `src/js/conversation.js` `buildMenu`, nonverbal branch (~4954): when
   a pending invite exists AND `inv.spoken` (the mime was shown at open
   this sitting), prepend `{ id: 'nv:accept', label: '(follow their
   gesture — go with them)' }` and `{ id: 'nv:decline', label: '(shake
   your head — not this time)' }`. No pending, or pending-but-unshown
   (staged mid-sitting, never mimed) → no choices: an unshown ask is
   never answered (INVITATION HONESTY r7, same rule as r132).
2. `src/js/conversation.js` `convoTurn` nv: override (~8547): intercept
   `nv:accept`/`nv:decline` before the winddown-delivery block; resolve
   through the existing handlers (`acceptInvite` — plot-ambush spring,
   sick veto, `resolveInvite` walk — / `declineInvite` — trust −1,
   decline line, pocketed thing), with gesture `youSaid`
   (`'(follow their gesture)'` / `'(shake your head)'` — never an
   English "Sure." in a no-words sitting), `diegeticAct` sayLine,
   `exchanges++`, and the same `convoMaybeWinddown` tail
   `betrayalTurn`'s finish runs. Mark substantive
   (`convoMarkSubstantive`), like the verbal accept path. No
   `resolveInvite` line changes, no demand/number/bar changes.
3. `src/js/conversation.js` `convoMenuPage` rank function: `nv:accept` /
   `nv:decline` rank 0 (same as `betrayal:`) so a long nonverbal menu
   (interpreter present) cannot page the mime's answer off page 1.
No new system, no new file: two touch points in one file, one
existing handler reused.

**Known wrinkle, recorded not fixed (out of scope):** `resolveInvite`'s
outcome lines quote the NPC in English ("Don't tell the others...") —
in a no-shared-words sitting the player "hears" words they share none
of. The walk outcome is narration of a shared act, not a conversation
beat, and the verbal path speaks the same lines; rewriting the outcome
lines for nonverbal is a separate prose task. Noted here, not built.

**Proof (before/after, same test).**
`scripts/test-journey-scale-r133-trapline-20261112.js` — harness game
(seed 133100), a no-shared-language villager with a staged pending
invite. Sections:
1. Mime shown (nvOpen) → full menu offers `nv:accept` + `nv:decline`
   — RED on unfixed code (absent), GREEN on fixed.
2. `nv:accept` consumes the pending invite, records a walk outcome in
   the invite history, and the transcript's YOU line is a gesture, not
   English ("Sure." must not appear as a YOU line) — RED/GREEN.
3. `nv:decline` consumes the pending invite, trust −1 — RED/GREEN.
4. No pending invite → no `nv:accept`/`nv:decline` — GREEN both engines.
5. Pending but unshown (`inv.spoken` false — staged after open) → no
   `nv:accept`/`nv:decline` — GREEN both engines (the honesty guard).
6. Per-sitting scope: leave unanswered → next sitting re-mimes and
   offers again (`inv.spoken` reset by endConvo) — GREEN both engines
   for the re-mime; the offer itself is §1's RED/GREEN.
7. Verbal-path regression guard: pending invite, spoken beat NOT an
   invitation → full menu has NO `betrayal:accept`; invite spoken via
   sayLine with tag 'invitation' → menu restricted to
   betrayal:accept/decline/leave/silence — GREEN both engines.
8. Q2 mechanism pin (see Q2): pending invite + non-owning opener →
   startConvo puts the invite label in `c.transcript` AND restricts the
   turn-0 menu to betrayal accept/decline/leave/silence — GREEN both
   engines (pins the invariant, not the fix).

**Panel bar (Q1 GO iff all hold):** ≥1 trap-line sitting in the 4-seed
panel where the mime is shown AND the policy answers it (accept or
decline), with the pending invite consumed; 0 defect talks (mime shown,
no answer offered). The driver picker takes `nv:accept` before `nv:nod`
(a competent player answers the mime instead of nodding past it);
`nv:decline` sits in DEFLECT beside `betrayal:decline`.

## Q2 (SECONDARY) — BETRAYAL SIBLING: Thabo verdict + transcript fix

**Hypothesis (from code read this run, to be pinned by the §8 test): NOT
A DEFECT.** The turn-0 menu restriction is itself the proof. `convoMenuPage`
restricts a menu to `betrayal:accept/decline/leave/silence` ONLY when
`c.spokenBeat?.tag === 'invitation'` AND a pending invite exists — and
`startConvo` resets `c.spokenBeat = null`, so no stale tag survives from
an earlier sitting. In Thabo's sitting the opener (grief thread) does NOT
own the reply (`openerOwnsReply` is false: no pendingQ/reactiveQ/genericQ,
thread 'grief' not 'want'), so `startConvo` spoke the invite beat
immediately via `sayLine(vid, inviteBeat, { inviteBeat: true, tag:
'invitation' })`. Invite beats are EXEMPT from both no-repeat blocks
(`sayLine`: `diegeticAct = inviteAct || ...` — never blocked, never
fallback), and `sayLine` pushes every chunk to `c.transcript` and records
the spoken beat. The invite label WAS in the transcript — the driver's
log prints only `r0.line` (the opener), so the invite beat is invisible
in the file. **The instrument under-reports; the menu was honest.**
The r132 "unverified" was a logging gap, not a game gap.

**Work:** (a) pin the invariant in the §8 proof section (mechanism test,
green both engines); (b) fix the DRIVER (not the game): `runConversation`
logs the full opening transcript (every THEM entry in `c.transcript`
after `startConvo`), not just `r0.line`, so future raise/betrayal reads
see every beat spoken at open. (c) Read the r133 panel's betrayal
sittings in full: any turn-0 `betrayal:accept` offer must have its
invite label in the same sitting's opening transcript, or it is a live
defect and Q2 flips to a build.

**Q2 bar:** verdict recorded with the transcript evidence; driver logs
the full opening transcript in the r133 panel; 0 live defect sittings
in the panel (invite label absent from the opening transcript while
`betrayal:accept` is offered at turn 0).

## Q3 — TRAJECTORY SHAPE (guardrail)

Lived-days within ±25% of the r132 band's 497; no alive/dead flip
without an attributed cause (per the r132 attribution rule: the fix
can only change whether a mimed invitation is answered, never a
demand, a number, or a bar — a death is attributable to the fix only
if it follows a trap-line accept/decline outcome). Lesser seat priced
4/4 expected; vetbar guard kept (zero readiness/ladder disagreements
on all 4 seeds). The panel runs on the collapsed base; the survival
collapse stays the bisect's question, not this run's.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal
sittings (the r132 driver skipped comm-'none' villagers — this run's
driver runs a nonverbal sitting on CONVO_DAYS when a comm-'none'
roster villager exists, saved as `*-nv.txt`). Bar: senseless 0 for the
trap-line class (a mimed invitation answered with a gesture that fits
what was shown; no English YOU lines in a no-words sitting; no nod
loops past the answer). The nod-loop variety observation (r132: nv:nod
×4 with near-identical nod-backs) is re-checked in the nonverbal
sittings, not re-litigated as a defect.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser
seat priced, tribute delivered, wave reached, fights, wave-4 kills).

## Panel

- **Seeds: FRESH 133101–133104** (freshness verified below; fixture
  seed 133100 for the proof test). One seed per process (r183 adoption:
  driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as r131/r132)
  + `nv:accept` in ENGAGE before `nv:nod`, `nv:decline` in DEFLECT.
- **Driver:** `scripts/journey-scale-r133-20261112.js` (r132 driver cloned:
  labels/EVIDIR/seed list only, PLUS the full-opening-transcript log,
  the nonverbal sitting on CONVO_DAYS, the nv: picker entries, and the
  r132 vetbar recorder kept as a regression guard).
- **Analyzer:** `scripts/analyze-journey-scale-r133-20261112.js` (r132
  analyzer cloned + trap-line classifier: mime shown → answer offered →
  answered/consumed; betrayal sittings checked against the full opening
  transcript).
- **Pilot:** seed 133101 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

133101–133104: 0 hits in `evidence/**/*.md` and `scripts/` (full-tree
grep, 2026-11-12), 0 filename hits; fixture seed 133100 likewise 0.
Fresh band confirmed before the panel runs.

## Metric review (to fill at closeout)

- Q1: the panel bar + proof RED→GREEN as written.
- Q2: the verdict + driver-log change as written.
- Q3/Q4/Q5: as written.

## Carried (not this run's to build)

Baraka unvoiced raise (0 mentions r132 band — re-check in the r133
panel, not a build); monster-veteran +3 damage gap (Steve call / sized
prereg); `tbVillagerFalls` vp.dead lie (wider fix, needs a panel);
guest-death (Bing) prereg; survival-collapse cause (bisect owns it);
scholar-payment open item (Steve-call); scale.json baseline regime
re-label; origin/master divergence (ship loop owns); the spoken-raise
answer window crowded out by a follow-on beat (r132 observation);
nod-loop variety (observation, re-checked Q4).
