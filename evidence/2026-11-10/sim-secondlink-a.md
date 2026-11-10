# Second-link road recorder — Loop A verdict (run fleshout-20261110T0415Z, arm sim-secondlink-a)

Axis: winnability chain (the polity half of sim-findings #2061).
DIAG ONLY, zero src/js. Gates, prices, deeds, and readyDemand
untouched. If the implied lever is a build (a second-link road),
it is NAMED here, not built here.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-10/sim-secondlink-a-prereg.md`
(commit 9095da70f). In short: competent policy verbatim, default
env, seeds 99101–99108 (the gearbar/vetbar/standaccum/trustgrowth
band re-run on current master — re-use recorded, NOT claimed as
freshness), 150d death-aware horizon, daily link-raise recorder
(pendingLinkRaise snapshots + `tele('bond_proposed')` capture +
method wraps + per-villager eligibility census). DIAG-GO iff:
(1) every link on the band classified by raise outcome
(raised / staged-and-lost / never-staged); (2) second-raise
stagings enumerated with count + fate; (3) neutrality — OFF leg
reproduces trustgrowth-b wall numbers (wins 0/8, national 0/8,
per-seed days on ≥7/8) AND ON leg matches OFF exactly on days +
standing; (4) instrument errors 0.

## Grounding verified in code before the judged pilot (not assumed)

- Seasoned (`hierarchy.js` `_linkSeasoned`): active, 30+ days
  old, trust 40+. `polityOf('haven')` needs >= 3 seasoned
  subordinates (docs/SCALE.md: a polity is one primary with ≥3
  seasoned subordinates — four fires under one head).
- The link-raise machine (`bond-initiation.js`, verified by
  reading, not assumed): `stageLinkRaise` gates (raiser alive,
  person-trust ≥ 20, `build_standing` ≥ 1, raiser personally
  knows the village, village unlinked, no pending raise, 14-day
  re-raise cooldown, no undelivered talk request); `npcLinkRaiseTick`
  (daily, ≤1 staging/day, hash-roll lottery 0.5, expires pendings
  older than 2 days); `acceptLinkRaise` tells the lore then calls
  `proposeLink`; `proposeLink` returns the formed link (score
  ≥ 55), `'counter'` (35–54), or null (declined / shut door).
  Lore spreads when the scholar tells a villager about a village
  at conversation end. Lotteries are hash rolls — the instrument
  reads them without consuming Math.random.
- Policy facts (verified by grep): plain `competent` contains
  ZERO scale code — no `tendLink`, no `proposeLink`, no counter /
  accord handling. It DOES talk, but `talkRound` opens one
  conversation a day and walks straight out (`endConvo 'left'`,
  zero exchanges); held conversations (`deepTalk`, up to two
  sittings a day with real turns) run only under
  `COMPETENT_TALK=1`, which is OFF by default. That default is
  what the prereg binds — competent verbatim.
- `_formLink` callers, inventoried by grep (the complete list):
  `proposeLink` (score ≥ 55), `answerCounter` (accept /
  sweeten), `answerRaid` (terms / strike), `_ladderRewardLink`
  (meta-progression stage-3 reward). No other path forms a link.

## Verdict — DIAG-GO (judged strictly against the prereg)

1. All 37 candidate villages classified by raise outcome, none
   forced: raised 0, staged-and-lost 24, never-staged 13,
   unknown 0. Every first-link village carries the `[LINK]`
   marker in the analyzer output — it holds a link AND every
   raise staged for it was lost, because the link did not come
   from a raise (see below).
2. Second-raise stagings enumerated: 91 band-wide, fates
   89 expired + 2 pending-at-end, 0 accepted, 0 refused.
   (All stagings: 104, fates 102 expired + 2 pending-at-end.)
3. Neutrality holds on every check: OFF leg reproduces
   trustgrowth-b exactly — wins 0/8, national 0/8, per-seed days
   8/8 (132/58/132/150/109/87/150/62), standings 8/8
   (270/199/199/199/150/199/199/25); ON leg matches OFF exactly
   on per-seed days 8/8 AND standing totals 8/8.
4. Instrument errors 0 on all 8 seeds, both legs.
   Reconciliation: 104/104 staged tele events match a snapshot
   transition (pending raise seen, or decision + formation
   within 3 days); 0 irreconcilable.
Proof: `scripts/test-secondlink-a.js` — 13/13 PASS (8 fixture
classification legs incl. the roll-vs-lore and link-without-raise
cases, plus live install/shape/tele/wrap legs, a determinism leg,
and a 12-day ON-vs-OFF neutrality miniature). Balanced panel
(§15): no before/after LEVER comparison exists for a diag, so
none is fabricated and none is attached; `balance-panel.js`
runs sweep comparisons, not recorder corpora (bandfreeze-b §15).

## THE SECOND-LINK ANSWER (plain words)

Second raises ARE staged — constantly — and every single one
dies unanswered. Across eight villages, villagers raised the
idea of a second link 91 times, and 89 of those asks expired
after three days without anyone answering them; the other two
were still sitting unanswered when their villages died. Not
one was accepted. Not one was even refused. Nobody said no —
nobody was ever asked in a way that could be answered.

The asks are real. A named villager who knows another fire
says, in so many words, "I've heard good things about
Stonebridge. We should link with them — we'd be stronger
together." The village stages the ask as a talk request, the
way a person would bring something up when they next see you.
And then the scholar — the player, played by competent —
never sits down for the conversation. Competent talks to one
random villager a day and walks straight out again, zero turns
taken. A raise lives three days. In that window the raiser is
almost never the one talked to, and on the one day in the
45-day probe when the raiser WAS talked to and the choices
"All right. Let's ask them." / "Not them. Not now." were
sitting right there in the menu, no turn was taken at all —
the conversation was opened and closed without a word.
Twice more the raiser was talked to, but those villagers share
no language with the scholar, so the link choices never even
appear in the menu — the language gate silently removes the
question. The contrast case is the person-bond proposals:
villagers ask EACH OTHER, the target decides by character with
no conversation needed, and 14 were accepted and 17 refused
on the same band. The machinery works when no conversation is
required. The link raise is the one ask that must pass through
a conversation, and competent never has one.

And the first link — the one every village does form — never
comes from a raise at all. On all eight seeds the first link
was granted by the meta-progression ladder's stage-3 reward:
when the village's standing reaches the National rung, the
System grants a link with the best-known unlinked village
(`_ladderRewardLink` → `_formLink`). Proven by stack trace on
99101 (ladderStageBeat → ladderGrantStageReward →
_ladderRewardLink → _formLink, day 37), and by elimination on
all eight: `proposeLink` was never called (0 propose calls),
no raise was ever accepted (0 accept calls), no counter was
ever pending, and competent never calls `raidVillage` /
`answerRaid` (verified by grep on the policy). So the band's whole
diplomacy story is: one link, granted from above, and then
ninety-one invitations from below, all left to expire.

## Per-seed table

| seed | days | end | first link | stagings | second | fates | elig-raiser days | lottery pass |
|------|------|-----|------------|----------|--------|-------|------------------|--------------|
| 99101 | 132 | lost | Stonebridge d37 (34) | 29 | 24 | 29 expired | 88 | 37/88 |
| 99102 | 58 | lost | Emberhold d17 (30) | 4 | 3 | 4 expired | 13 | 4/13 |
| 99103 | 132 | lost | Stonebridge d27 (30) | 12 | 10 | 12 expired | 42 | 16/42 |
| 99104 | 150 | survived | Emberhold d43 (30) | 28 | 25 | 27 expired + 1 pending | 69 | 30/69 |
| 99105 | 109 | lost | Emberhold d32 (34) | 2 | 2 | 2 expired | 9 | 2/9 |
| 99106 | 87 | lost | Emberhold d27 (30) | 5 | 5 | 5 expired | 16 | 11/16 |
| 99107 | 150 | survived | Emberhold d47 (30) | 24 | 22 | 23 expired + 1 pending | 80 | 31/80 |
| 99108 | 62 | lost | Emberhold d41 (30) | 0 | 0 | — | 0 | — |

Band: 104 stagings (91 second), 102 expired + 2 pending-at-end,
0 accepted, 0 refused, 0 counters staged, 0 propose calls via
any raise. Candidate villages: 37 (24 staged-and-lost, 13
never-staged, 0 raised, 0 unknown). Seasoned links max 1
(99104, per trustgrowth-b). Polities 0.

## The never-staged thirteen (which gate blocks staging)

All 13 never-staged villages share one dominant gate:
`no-build-standing` — on every raiser-day when the village was
known and unlinked, the villagers who knew it did not carry a
`build_standing` goal weight ≥ 1. Band-wide gate census
(raiser-days): no-build-standing 5,557; no-lore 2,565;
trust<20 560; talk-blocked 547; all-open-cooldown 415;
has-pending 296; all-known-linked 285. Two readings, both
true: (a) the staging pipeline is NOT starved — 317
eligible-raiser-days band-wide, lottery passing on 131 of
them, 104 stagings actually fired; (b) the pool of possible
raisers is thin — most villagers never carry the standing
goal, and most villagers know only one or two villages
(often only the already-linked one). 99108 is the pure case:
0 eligible-raiser-days in 62 days, 0 stagings — the village
never had anyone who could raise at all.

## Why the staged raises expire (talk probe, seed 99101, 45 days)

A scratch probe (not judged; `/tmp/talk-probe.js`, wraps
`talkTo`/`convoChoices`/`convoTurn` on a 45-day re-run) found:
competent holds 1 conversation a day, to a random villager,
and takes zero turns in it (`talkRound`: open, `endConvo
'left'`). A raise lives 3 days. In 45 days only 3 talks
happened while a raise was pending: d10 gen_cqgh878 (choices
offered incl. `link:accept` / `link:decline` — no turn taken),
d27 and d40 sanne_bakker (no shared language — the menu was
nonverbal only, `nv:nod`/`nv:smile`/`nv:pointself`/`nv:listen`,
no link choices at all; the language gate in `bondChoices`
returns nothing at commLevel 'none'). Zero `convoTurn` calls
while a raise was pending, band-wide implication: 0 accepts
and 0 refuses is not a decision outcome, it is a
never-asked outcome. Whether `COMPETENT_TALK=1` (held
conversations) or the leadcourt policy answers raises is NOT
measured here — it is the follow-up question for the build
arm, named below.

## The first link comes from the ladder (formation-path elimination)

`_formLink` has exactly four callers (grep, all of src/js):
proposeLink, answerCounter, answerRaid, `_ladderRewardLink`.
On this band: proposeLink 0 calls; pendingCounter never true
on any seed (so answerCounter never fired); competent never
calls `raidVillage` / `answerRaid` (verified by grep on the
policy, so answerRaid never fired); the ladder
reward fires once per stage-3 reach. The stack-trace probe on
99101 pins it: `ladderStageBeat` → `ladderGrantStageReward`
→ `_ladderRewardLink` → `_formLink('village_1')`, day 37.
So the first link is a standing-milestone grant, not a
courtship outcome — and it is the ONLY link the road ever
produces, because the second link would have to come through
the raise path, and the raise path expires unanswered.

## Wall numbers (this pilot)

Wins 0/8. National 0/8, table 0/8 (scaleRank "regional" on
all 8). Wave-4 unlocks 7/8, wave-5 unlocks 1/8 (99101).
Median run-days 120.5 (2 seeds censored at the 150d horizon:
99104, 99107 survived). Seasoned links max 1 (99104).
Polities 0 on every road on every day. Death causes not
instrumented by this arm — not reported, not guessed. The
wall did not move on this run: the band's numbers reproduce
trustgrowth-b exactly, which is the non-perturbation proof,
not a new wall reading.

## Village assessment (plain words)

Picture eight villages, each holding exactly one friendship —
one other fire that bowed to them, early, granted by the
System when their standing crossed a line, not earned by
anyone asking. And meanwhile, all around the fire, their own
people keep bringing up the next friendship: ninety-one
times, someone who knows another village says "we should
link with them — we'd be stronger together." The ask is put
on the table, written down as a thing to talk about. And
three days later it is gone, unanswered, because the scholar
never sits down long enough to hear it. The villagers are
not shy. They are not ignorant — they know six fires by name
on the richest seed. They ask, and the asking itself works
fine: the staging fires, the line is spoken, the talk request
is written. What doesn't work is the answering: the player
never takes a turn in a conversation, and the villagers who
do get talked to often share no words at all. One village in
eight never even had anyone who could ask. The diplomacy road
isn't blocked at the asking. It's blocked at the listening.

## Sense-test

- The raise lines read like people, with one template
  wearing thin: every raise on 99101 cites rumor — "I've
  heard good things about Stonebridge. We should link with
  them — we'd be stronger together." — the same sentence for
  Emberhold, Thornfield, The Bloodied, The Red Table, The
  Bloodied II. The `how` variants exist in code ('visit' /
  'seen-nearby' / 'rumor' / 'told'), but on this band every
  captured raise line is the rumor variant: the lore these
  villagers hold is secondhand, and the line is honest about
  that. A raise that cited a visit it never made would be
  theater; this one isn't — but six identical sentences from
  six villagers is a voice-pool note for later, not a defect
  in the ask.
- The formation lines read like people: "⛓️ Enrique brings
  it home: Stonebridge bows to Haven — one organization, us
  primary. Tribute: 4,000 kcal/week. The relationship starts
  at trust 30. Everything from here is earned." + Codex:
  "First link formed with Stonebridge. The gesture goes out
  now; the Dawn waits for seasons." A named villager carries
  the news; the System narrates the season it will take.
  (One instrument note: the say sample's filter lacks the
  word "standing", so the ladder reward's own line — "Word
  of Haven's standing reaches Stonebridge…" — was filtered
  out of the sample. It is not missing from the game; it is
  missing from this corpus. See metric review.)
- The d10 scene is the sense-test in miniature: the menu
  offers "All right. Let's ask them." / "Not them. Not now."
  and the conversation ends without either being chosen —
  the player walked out mid-ask. That reads as a real social
  moment (a question left hanging), not a number.
- No robotic villager behavior was flagged by this arm's
  corpus beyond the template repetition above; the
  sense-test gap is the unanswered mail, not behavior.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The DIAG-GO bars held up: the classification separated the
  band cleanly (24/13/0/0), reconciliation went 104/104 with
  zero residue, and neutrality reproduced trustgrowth-b
  exactly on all four checks. No bar needs lowering or raising.
- Trustgrowth-b's evidence text reports "median 132"; the
  per-seed days it lists (132/58/132/150/109/87/150/62) sort
  to median 120.5, and this run reproduces the same list, so
  the same 120.5. The prereg bound the bar on the per-seed
  list (8/8 exact), and that held; the "132" in the older
  text is likely a different median (or a slip) — the next
  run should quote the per-seed list, not the old median.
- Two instrument gaps, both found live and fixed or disclosed
  before the verdict:
  (a) The `stageLinkRaise` method wrap is DEAD — `npcLinkRaiseTick`
  calls the closure function directly, not `G.stageLinkRaise`,
  so the wrap records 0 calls on all seeds. The verdict never
  depended on it (staging is read from tele events +
  snapshots, which reconcile 104/104), but the wrap's zero is
  not evidence of zero stagings — a future instrument must not
  treat a method wrap as coverage of a closure call. The
  `acceptLinkRaise` / `declineLinkRaise` / `proposeLink` wraps
  ARE live (they go through G), and their zeros are real:
  no accept, no decline, no propose on the band.
  (b) The analyzer's first version built the "known" village
  set from the region roll as well as lore, and counted gate
  days after a link had formed — misclassifying roll-only
  villages as never-staged and letting 'all-known-linked'
  swamp pre-link gates. Fixed before the judged analysis
  (known = lore only; gate days = known AND unlinked) with
  two new proof tests (roll-only village → unknown;
  link-without-raise → staged-and-lost + `[LINK]`). The
  headline counts moved 24/17 → 24/13 (+4 unknown, now
  reported as 0 because lore-known villages are all
  classified); the verdict is unchanged.
- The instrument does not capture link history notes
  (`snapshotLink` has no history field — the trustgrowth
  instrument enriched it, this one did not). Formation
  provenance was established by elimination + stack trace
  instead; a future instrument should carry historyNew.
- Say-sample filter gap: the filter
  /link|bond|raise|polity|realm|season|tribute|trust/i lacks
  "standing", so the ladder reward's announcement line never
  entered the sample. Add "standing" to the filter next run.
- Class note: the prereg classes are RAISE-outcome classes,
  and the analyzer now carries `linkFormed` / `formedViaRaise`
  alongside them, because a village can hold a link formed by
  another path while every raise for it was lost. The
  distinction is the finding, not a fudge — keep both fields.

## Next blanks, in order

1. **Answer the mail, on the link road (the second-link build,
   NAMED not built).** The raise path stages fine and dies
   unanswered because competent never takes a conversation
   turn. A build arm should measure, on this band: does
   `COMPETENT_TALK=1` (held conversations) or the leadcourt
   policy answer raises — and if raises get answered, do
   second links form, and does the polity follow? The
   decision the build must make explicit: is the fix "the
   player must sit down" (policy/conversation behavior) or
   "the ask must survive longer / find the player another
   way" (a longer pending window, a re-raise that seeks the
   scholar out, an answer that doesn't need a held
   conversation)? Do NOT move readyDemand numbers or any win
   price/deed gate on this evidence.
2. **The thin raiser pool.** 13 never-staged villages, all
   gated on `no-build-standing` (5,557 raiser-days band-wide),
   and 99108 with zero eligible raisers in 62 days. Whether
   more villagers should carry the standing goal, or the
   build_standing ≥ 1 gate should admit a wider drive, is a
   design question for the build arm — the staging pipeline
   itself is proven live (104 stagings), so this is second
   order behind the answering problem.
3. **The language gate on link asks.** Villagers with no
   shared words never get link choices at all (sanne_bakker
   d27/d40: nonverbal menu only). A raise staged by such a
   villager is unanswerable by construction — its 3-day life
   is spent waiting for a conversation that cannot contain
   the question. Whether the pending window should toll while
   unanswerable, or the raiser should wait until they share
   words, is a design question.

## Findings for the coordinator

- **SECOND RAISES ARE STAGED AND LOST, NOT NEVER STAGED
  (DIAG-GO).** 104 stagings band-wide (91 second-raisings),
  fates 102 expired + 2 pending-at-end, 0 accepted, 0 refused.
  Every candidate village classified: 24 staged-and-lost, 13
  never-staged, 0 raised. Reconciliation 104/104. (This arm.)
- **THE FIRST LINK IS A LADDER GRANT, NOT A COURTSHIP
  OUTCOME (DIAG-GO).** `_ladderRewardLink` → `_formLink`,
  proven by stack trace on 99101 (d37) and by elimination on
  all 8 seeds (propose 0 calls, accept 0, counter never
  pending, competent never calls raid verbs). (This arm.)
- **THE EXPIRY MECHANISM IS ZERO CONVERSATION TURNS
  (DIAG-GO).** Competent talks to 1 random villager/day and
  takes zero turns (`talkRound` open + walk out;
  `COMPETENT_TALK` off by default). 45-day probe on 99101: 3
  talks while a raise was pending; 1 offered `link:accept`
  with no turn taken; 2 had no shared language so no link
  choices existed. Contrast: person-bond proposals decide by
  character without conversation — 14 accepted / 17 refused
  on the same band. (This arm.)
- **THE RAISER POOL IS THIN (DIAG-GO).** 13 never-staged
  villages, all gated on `no-build-standing`; 99108 had 0
  eligible-raiser-days in 62 days. Staging itself is live
  (317 eligible-raiser-days, lottery passing 131/317). (This
  arm.)
- **METHOD-WRAP COVERAGE GAP (method finding).** A wrap on
  `G.stageLinkRaise` records nothing because
  `npcLinkRaiseTick` calls the closure, not the Game method.
  Future instruments must verify a wrap's call path is live
  before treating its zero as evidence. (This arm; prereg
  amendment not needed — the verdict never used the wrap.)

## Proof and landing

- Prereg: `evidence/2026-11-10/sim-secondlink-a-prereg.md`
  (commit 9095da70f).
- Instrument + driver + analyzer + proof:
  `scripts/secondlink-instrument-20261110.js`,
  `scripts/secondlink-driver-20261110.js`,
  `scripts/secondlink-analyze-20261110.js`,
  `scripts/test-secondlink-a.js` — proof 13/13 PASS
  (commit 6c7e0bbac).
- Corpus: `evidence/2026-11-10/perseed-secondlink-a/`
  (16 files: 8 ON + 8 OFF), summary
  `evidence/2026-11-10/secondlink-summary-secondlink-pilot.json`.
- Logs: `secondlink-pilot-on.log`, `secondlink-pilot-off.log`
  (worktree root, scratch — not committed).
- Probe scripts (`/tmp/formlink-probe.js`,
  `/tmp/talk-probe.js`, `/tmp/say-probe2.js`) are scratch
  diagnostics, not committed: the formation-path stack trace
  and the talk mechanism are quoted in this evidence, and the
  judged corpus carries the numbers.
- Zero src/js changed. Commits to be merged locally by the
  coordinator; report 'merged locally, pending ship' readiness.
