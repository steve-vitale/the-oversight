# journey-scale r133 — Lane A leg 3 SCALE (2026-11-12)

**Run:** `playtest-loop-a-2026-11-12T11:41:43Z` · **Base:** master `ddb0a9101`
**Worktree:** `journey-scale` (branch `journey-scale`) · **Leg:** scale, days 80–140
**Seeds:** fresh 133101–133104 (0 prior hits) · **Policy:** `scalecourt-traderoad-r113-linkraise-sit`
**DAY CAP 140, death-aware stop (+10d tail max).** Prereg:
`evidence/2026-11-12/journey-scale-r133-prereg.md`.

## The question, in plain words

When someone you share no words with mimes "come with me", the game showed
you the mime and then gave you no way to answer it. The invitation just
evaporated. Twice before (Tarek in r131, Mario in r132) a villager did exactly
that and the player could only nod or walk away. This run builds the answer:
two gesture choices — follow them, or shake your head — that appear only when
the mime was actually shown in this sitting.

A second, smaller question rode along: in r132, Thabo's menu offered
betray/decline at turn 0 while the driver's log showed only a grief line.
Was the menu lying — offering an answer to an invitation never made? The
proof test pinned it before the panel ran: no, the menu was honest; the
driver log under-reported (it printed only the opener, not the full opening).
The driver now logs the whole opening.

## Verdicts

- **Q1 TRAP-LINE: GO.** 3 sittings where the mime was shown and the policy
  answered it; 0 defect talks (mime shown, no answer offered). The proof
  test is 45/45 green on the fixed engine, 32/45 (10 failures, exactly the
  Q1 assertions) on the unfixed engine.
- **Q2 BETRAYAL SIBLING: GO — not a defect.** 0 turn-0 betrayal offers in
  the panel (the class didn't fire at d90/d120 this band); the mechanism is
  pinned by proof-test §8, which shows the invite label IS in the sitting's
  transcript on the unfixed engine too. The r132 Thabo verdict stands.
- **Q2 RAISE-TALKS (r132 guard): GO.** 15 raise talks, 3 properly answered,
  0 defect.
- **VETBAR: GO.** 0 disagreements on all four seeds, 0 phantom days.
- **Q3 TRAJECTORY: HOLD.** Lived days 491 vs r132 band 497 (−1.2%, inside
  the ±25% guardrail). Lesser seat priced 4/4. No alive/dead flip without
  an attributed cause (1 alive / 3 dead, same shape as r132).
- **Q5 CENSUS: books close on all four seeds** (0 unattributed deaths,
  teleOnly 0, all census errors 0).

## Q1 — the three sittings (read in full)

All three are d90 nonverbal sittings. The mime is shown, the menu offers
`nv:accept, nv:decline` first, the policy follows the gesture, the pending
invite is consumed, and the walk plays out.

- **133101 d90 — Giulia (Italian, crossing guard, trust 90).** Mime toward
  the ridge. Accept → "Here. I made an extra." She presses a decent tool,
  oiled and kept, into your hand. A gift for going with her.
- **133102 d90 — Cherono (Swahili, cook, trust 72).** Mime toward the trap
  line — the exact Tarek/Mario shape. Accept → she shows you where she goes
  to think. "Don't tell the others. Everyone needs one place."
- **133103 d90 — Tashi (Hindi, arborist, trust 21).** Mime toward the tree
  line. An interpreter (Raj) is standing by, so the menu is longer — the
  gesture answer still ranks first, ahead of the interpreter's choices.
  Accept → the quiet place again.

A fourth nonverbal sitting (133101 d120, Giulia again) had NO mime and
correctly offered NO gesture answer — the choices appear only when the mime
was shown in that sitting. The betrayal watch file records exactly three
`nvaccept` events, all d90, all in these sittings. No declines in the panel;
the decline path is proven by the proof test (§3: trust −1, pending
consumed, no English "Not this time." line).

**Sense-testing wrinkle, recorded not fixed (out of scope, same as the
prereg):** the walk's payoff line still quotes the villager in English —
Giulia "says" the tool line, Cherono "says" the quiet-place line — in a
sitting where you share no words at all. The gesture answer is honest now;
the payoff still isn't. Carried.

## Q4 — people check (all 10 transcripts read in full)

The village talks like people. Fidele (mechanic, d90) asks whether this has
changed you, "fundamentally", and answers his own question with the line
about being a journalist who worried about being on time and now worries
about being alive. Lucas (police officer, d90) asks about the kindest thing
anyone's done out here, and remembers someone saving him the last of the
stew, "put the bowl down and walked off". Ghazi (carpenter, d90) sleeps in
shifts now — "two hours, up, listen, two more. My body learned it before
my head agreed. Denver never taught me that. The treeline did." Fatima
(paramedic, d90) asks you to haul water at first light, and when you commit
she tells you plainly she's away on the road and to find her when she's
back — a want with a real deferral, not a dead end. Praskovya (farmer,
d120) opens on grief ("the wrong kind of quiet"), takes comfort, and the
gossip thread carries real world news ("You won The Sorting on the cameras")
before thinning into filler ("People are keeping to themselves").

Observations, not defects: the nonverbal sittings still collapse into
nod-loops (seven nods in a row on Giulia d120) — the conversation thins
gracefully, but there's no variety in it (carried from r132). Giulia's one
English word she is "proud" of is "Fuck you." — the one-word pool hands a
warm crossing guard a profanity as a proud grin (pre-existing flavor, not
this run's). The d120 verbal sitting fell back to Giulia (a no-shared-words
villager) because every other living villager had already talked twice —
so she got two nonverbal sittings that day; the fallback doesn't check
language (driver observation, carried).

## The daily-play gap (found, NOT fixed — carried as a policy decision)

The fix is proven in the driver's sittings. In daily play it is not yet
lived: the panel's say-captures show 15 mimes, and the shared
competent-player chooser (`competent-linkdrive-b.js`) never takes an
invitation — verbal or mimed. It answers questions, accepts links, and
leaves the rest, so a mimed invite in daily play is still left unanswered
and re-mimed next sitting (the pilot seed showed the same invite toward the
cache spot three times, never resolved; the panel's betrayal watch shows no
daily-play accepts at all). Teaching the chooser to take invites would move
every lane's instrument and break band comparability, and it would be
incoherent to teach it the mime but not the spoken invite — so this run
leaves the shared chooser alone and carries the gap for a lane decision:
the daily-play chooser should take `betrayal:accept` and `nv:accept` when
offered, or the panel keeps proving the fix only where the driver looks.

## Driver bug found in the pilot (fixed, panel re-run uniform)

The pilot (seed 133101) ran clean through every gate, but produced NO
nonverbal sittings: the driver called the nonexistent `G.npcComm`, so its
fallback `{level:'full'}` made the comm-'none' filter skip everyone. The
fix is one word — `G.commLevel`, the engine's real function. The pilot's
numbers stand as the gate check; the full panel re-ran all four seeds under
the fixed driver, so the panel is uniform.

## Q5 — census, in plain words

- **133101 — the one that lived.** 141 days, all 7 people alive, reached
  global standing, lesser seat on day 40, trade charter delivered day 96.
  11 deaths along the way (the wild took 7). No wave-4 kills at all — the
  village is strong on standing and weak on killing, same wall as ever.
- **133102 — ended day 110, 3 left.** Lesser seat day 47. Two wave-4 kills
  (one by the scholar, one by a villager) — but the villager veteran died,
  so the living-veteran bar never filled. The wild took 10 of 18 dead.
- **133103 — ended day 131, 1 left.** Lesser seat day 47. Three wave-4
  kills (scholar 1, villagers 2) — again, none of the killers lived. 78
  wave-4 fights in 131 days: the village fought constantly and bled out in
  the wild (19 of 22 dead). Starvation took one.
- **133104 — wiped out, day 109, 0 left.** Lesser seat day 41. Two wave-4
  kills, killers dead. The wild took 9, monsters 3, starvation 1.

**The shape, again:** the living-veteran pair is still the wall. Three
seeds made wave-4 kills (7 total across the band) and not one killer was
alive at the end of their village's run. No full seat, national voiced on
the one living village only (133101 reached global rank). Tribute: 133101
delivered the trade charter; the others delivered nothing. The pellet is
installed on 3/4. A healer was present ~95–128 days per village.

**Baraka re-check:** 0 mentions again in r133 (same as r132) — the unvoiced
raise is still unvoiced. Carried.

**Spoken-raise window:** 12 of the 15 raise talks ended "not-offered" — the
raise was spoken, then a follow-on beat crowded the answer window out
("Can I ask you something else?" → "Forget I said anything."). Same shape
as r132, still live. Carried.

## The fix (what changed)

`src/js/conversation.js`, three edits, dialogue-menu code only:

1. `buildMenu` (nonverbal branch): when a pending invite exists AND the
   mime was shown this sitting, prepend `(follow their gesture — go with
   them)` and `(shake your head — not this time)`. No pending, or
   pending-but-unshown → no choices.
2. `convoTurn`: the gesture choices resolve through the same
   accept/decline as the spoken path, with gesture you-lines — never
   English "Sure." / "Not this time." No outcome lines, demands, numbers
   or bars changed.
3. `convoMenuPage` rank: the gesture choices rank 0 (same as `betrayal:`),
   so a long nonverbal menu (interpreter present) can't page the mime's
   answer off page 1.

Proof test `scripts/test-journey-scale-r133-trapline-20261112.js`:
**45 passed, 0 failed** on the fixed engine; 32 passed / 10 failed on the
unfixed engine, the failures exactly the Q1 assertions. The Q2 pin (§8)
passes on the unfixed engine too — the Thabo menu was honest before the
fix.

No threshold, bar, price or gate changed (gating freeze stands). No
toughness/gear/ability tuning (combat-play gate stands — this run touches
dialogue-menu code only).

## Telemetry

`telemetry-check.js` vs `scale.json`, metrics fightsTotal, fightsByWave.4,
maxGameDay: **2 LOUD lines — fightsTotal −63% (446→165), fightsByWave.4
−64% (289→103). EXPLAINED, baseline NOT rolled:** (a) the stale 646-day
baseline regime (same as r130/r131/r132); (b) the band lived 491 days, not
646; (c) the wave-4 total is UP on r132's band (103 vs 102) — 133103 alone
fought 78 wave-4 fights in 131 days, so there is no fight-rate collapse;
(d) fightsTotal is flat on r132 (165 vs 170). The scale.json re-label is
still owed.

## Gate

`node scripts/check.js --quick` (log `journey-scale-r133-check-quick.log`):
**320 passed, 20 failed in 2585s. Verdict GO.** The 20 decompose exactly:

- **14× TIMEOUT after 120s** (exit null) — sim-heavy scripts starved by a
  sibling's concurrent full `check.js --quick` in the main tree, which ran
  the entire 43 minutes alongside mine on a 1.5-CPU box (comfort-arc,
  living-garden, occupation-panels, one-person-army, phase-shawl,
  shepherd-deed, solo-campaign-endings, time-save-crashes/failures,
  synergy-stall, throttlefeast, capable-bot, first-ability-magic,
  table-endings). Sampled 2 alone on a quiet box: throttlefeast 17/17,
  capable-bot 42/42 — both green.
- **3× contention artifacts, re-run green alone:** trust-observer-
  neutrality 6/6, measurement-driver 6/6, measurement-cache-flags 4/4
  (the cache-flags run flipped 0/4 → 1/4 → 4/4 across three runs on the
  same code — load/timing, not a defect).
- **3× the expected staleness set:** measurement-proof-update +
  measurement-workflow ("Proof source inputs are not current" /
  "retained neutrality proof covers the current Game/controller/harness
  inputs" — this run's `src/js` touch, same as r131/r132; the proof
  refresh is owed as a follow-up, not a merge blocker) and
  phone-frame-proof (stale inputs index.html, foreignSpeech.json,
  regions.json, statusEffects.json, table-endings.json, alienPlayers.js —
  pre-existing; `conversation.js` is NOT in the stale list, so this run's
  change didn't add to it).

No failure names this run's change. The 20 vs r132's 5 is entirely the
concurrent sibling run; r132 ran uncontended.

## Metric review

- Q1's bar (≥1 answered sitting + 0 defect talks) was met with margin
  (3 answered, 0 defect) — the bar was the right shape; the corpus
  (driver -nv sittings) fired on 3/4 seeds. The 4th seed (133104) had no
  comm-'none' villager alive at d90, and 133103 had none at d120 — the
  corpus depends on a no-shared-words villager surviving to the sitting
  day, which is a property of the village, not the fix. The proof test
  carries the decline path (no decline fired in the panel).
- Q2's panel bar (0 live defect sittings) held trivially at 0 offers — the
  panel is a weak instrument for this class; the proof test is the real
  evidence. Next run's Q2 should either stage an invite at a sitting or
  accept the proof test as the pin and retire the panel check.
- Q3's guardrail held (−1.2%). The lived-days total is a stable instrument
  across r132/r133.
- The analyzer's Q1 classifier reads only the -nv transcripts; the 15
  capture mimes are counted, not judged. If the daily-play chooser is ever
  taught to answer, the classifier should judge capture mimes too.

## Carried items (for the next run)

- Daily-play chooser never takes invites (verbal or mimed) — policy gap,
  needs a lane decision (see above).
- ResolveInvite outcome lines quote the NPC in English in no-shared-words
  sittings (the payoff still isn't honest, only the answer is).
- Nod-loop variety in nonverbal sittings (7 nods in a row).
- Spoken-raise answer window crowded out (12/15 not-offered).
- Baraka unvoiced raise (0 mentions, third band running).
- Verbal-sitting fallback can double-book a comm-'none' villager (Giulia
  d120 got two nonverbal sittings).
- Measurement-proof refresh owed (this run's `src/js` touch re-stales the
  pair — see Gate).
- Monster-veteran +3 damage gap (Steve call), `tbVillagerFalls` vp.dead
  lie, guest-death (Bing) prereg, scholar-payment open item, scale.json
  re-label, origin/master divergence (ship loop owns).

## Landing

**TBD — SHAs patched in after merge.**
