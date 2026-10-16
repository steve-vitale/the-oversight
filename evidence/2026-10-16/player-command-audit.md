# Player-controlled turns from allied commands

Decision: retain the tactical handoff and recipient repair, with remaining
cost/availability gaps below. Baseline: `b52905e060341ca0d2231b7ef68c11f364e224ff`,
branch `codex/resume-claude`. Runtime changes are limited to game.js,
godpath.js, godverbs.js and app.js. Policies, observer, contract, magnitudes,
food costs and NPC planning thresholds are unchanged.

## The missing action is now a real choice

NPC Voice's Rally Cry and The Crowd Moves previously sent other NPC allies
through their immediate turn and explicitly excluded the player. Passing the
player to that AI routine would not deliver a human choice. The new bridge
queues the bonus, finishes the caster's real action and settles its cost/use
gate, then pauses the scheduler for the player. The existing combat controls
show `extra turn`; Strike, Study, movement, abilities and Wait remain normal
player choices. A chosen ability still pays its own normal food cost.

The bonus begins through normal player turn entry, including status ticks,
movement, rally expiry and stun. Finishing it restores the caster's position
in the existing order, then continues with the next actor. It does not advance
the round by itself or replace the next ordinary player turn. Multiple queued
commands remain separate. A full stun can consume a bonus, like an NPC's
commanded turn. A removed caster resumes at the next surviving scheduled
actor. A fight ending during the bonus grants no further live turn.

Both sync and browser steppers honor the handoff. The browser returns without
starting a foe timer while the player chooses. Generation checks reject stale
steps, and scheduled callbacks also retain their original fight identity:
after load, a new fight's generation can otherwise collide with an old timer.

Fight saves retain pending commands, the paused cursor, god-verb bookkeeping
and player/NPC class-use gates. Reloading a bonus does not replay the caster,
refund its food, reset its use limit or turn the bonus into the ordinary
round. A saved pending handoff opens player control directly on load. Dropping
an obsolete fighter preserves the known remaining order during a command;
pending speed changes still wait for the round wrap. Old saves without these
fields retain their normal defaults.

## Existing support terms and tradeoffs

`tbOtherAllies(actor)` selects distinct living allies, excludes the caster,
deduplicates canonical people and rejects current-bearer NPC aliases. Only
commands, Live Broadcast and Rally Aura adopt it; this does not silently feed
players through generic NPC heal/aegis AI. The command bridge rejects detached,
dead, fled, hostile and self-alias sources/recipients.

Voice still costs120kcal-equivalent NPC hunger and one actor turn, once per
fight. The player receives its existing three-turn rally flags, next two
strikes1.5x and an actual bonus turn; foes retain their hesitation. The strike
commitment lives in scholar._nextStrikes, the real player consumer, and replaces
an existing commitment just as the old NPC effect does. It can therefore
displace an earlier prepared strike effect; this is a needs-eyes tradeoff,
not a new stacking or strongest-effect rule. Only an unused tagged Relay
charge is cleared at fight end; a later unrelated commitment is preserved.
The previous fallen-Voice full-turn penalty remains in force.

Crowd Moves retains80kcal-equivalent hunger and its existing two-other-allies
NPC planning preference; the player now counts as one of those allies. It
does not invent a god strike bonus. A player caster still commands NPCs and
pays80kcal without commanding itself. Live Broadcast can select the player
under its existing one-ally preference. Nearby player recipients of NPC Rally
Aura receive the existing range/duration/rally effects.

## Verification

- Shared-kit runtime42/42, including real paid NPC callers, actual Strike,
  ordinary-turn preservation, status loss, multiple commands, removed/last
  casters, both steppers, save/load and an actual old/new-fight generation
  collision. Actual constructor proof covers the NPC aura's player recipient.
  Reconstructed candidate also passes42/42.
- The same proof on frozen baseline fails eight early handoff/cost/strike
  assertions, then stops at the absent `tbOtherAllies` API. The retained log
  is an expected negative control, not a completed42-check baseline run.
- Existing villager proof57/57; its old Crowd Moves assertion expected only
  two NPC recipients. It now requires three recipients and one queued player
  turn. This is the intentional new contract, not a waived/loosened assertion.
  The initial quick174/175 failure and updated175/175 quick result remain.
  Full suite947/947. Existing capable-bot progression25/25 also passes.
- Wiring: godverbs/godpath0 unwired; core retains the same25 legacy names
  as the frozen source. No new unwired function is accepted. No module is
  added/renamed, so region and ontology content are unchanged.
- Final-source phone390x844, native controls: Wait triggers a real paid NPC
  Voice cast; before any foe turn, bonus choice is available with hunger10→15,
  AI-player calls0 and chosen strikes0. A prepared obsolete fighter is dropped
  on reload while a faster foe and a pending speed change make order matter;
  the bonus remains controlled, and chosen Strike consumes one of two charges
  before any foe turn. A separate Crowd Moves scene pays10→13 hunger, saves
  and reloads the bonus, then lets the human choose Study. Wait returns normal
  round2 with one caster and one foe turn, no player AI call and no chosen
  Strike. Another prepared paid NPC ability queues a handoff before save;
  load opens bonus control directly. Native south movement costs one move,
  native Study spends the action, and another active-turn reload preserves
  two moves/zero actions without refilling either. JPEGs and final DOM retain
  the choices. Earlier phone fixtures/screenshots remain explicitly named
  prototype. These are granted late builds/prepared fights, not naturally
  earned campaigns.

## Campaign evidence and its boundary

Start the prototype with16 matched seeds in each of
capable/maker/merchant/caregiver, then extend to64 each. A final restore guard
is rerun on all64 per policy; its16-case view is extracted from that full run.
The first16 are a subset of64, not an independent holdout.
All256 outcome rows and all23 metric sets are equal. Comparator:
`no_material_signal`. No difficulty compensation, win target or regression
verdict follows from those rates. Both roots pass four seed7 observer-off
controls; no observer/runtime warnings occur. The prototype64-run driver
reuses68 exactly keyed16-screen jobs and adds192. The final guard run uses
260 fresh jobs. A cursor-only intermediate also retains260 jobs. Baseline,
prototype, cursor-only and final each retain260 unique jobs,1040 total;
source identities and cached results are never relabeled.

Full final-state hashes match in244/256. All12 differing cases are replayed
on both roots with passive call receipts and complete retained states. Every
replay reproduces its exact panel row, hash and23 metrics. After excluding
the standard known pacing diagnostics, their only differences are the five
new fields under state.run.tbfight: pending/current command metadata and
god/class use state. The verifier checks this structurally; raw hashes and
job identities remain unchanged. The first16 screen contains five such cases.

None of those12 named candidate replays offers an NPC player-command turn.
That is **not** a census of every cast in256 campaigns: equal final states
can hide transient histories, daily resident samples can miss holders, and
these mixed policies do not establish a dedicated support/pacifist strategy.
The standard sample does not certify natural acquisition or usefulness of
the new bonus. Future natural titan/coalition campaigns must reach actual
holders through fitting deeds and trace paid casts, useful player choices,
survival costs, losses and endings. Prepared success is not a balance verdict.

The baseline cache was produced with the previous unit's working source
(panel HEAD3ed70489). Every normalized runtime/policy/harness input is checked
against the archived b52905e0 baseline before reuse. Historical HEADs, observer
identity and results are retained verbatim. This unit changes no observer or
contract, so the existing neutral observer maintenance proof remains valid.

The original41-check prototype passed the full suite but a later42nd case
exposes a real save/load defect: if an obsolete fighter is dropped, load
rebuilds order and restarts at slot0. A faster foe can occupy slot0 while a
bonus is waiting for the player elsewhere, stranding the choice. The final
cursor-only repair explicitly selects the player slot while a bonus is active.
Further restore checks expose two incomplete contracts: rebuilding known order
can apply pending speed changes mid-round, and a pending queue needs an extra
driver call after load. The final repair preserves filtered known order and
delivers pending control immediately, resuming at its saved caster/next keys.
Original prototype and cursor-only sources,260 jobs each, proof snapshots and
negative logs remain. The old edge proof records41-pass/1-fail on the original
prototype; the final42-check proof records40-pass/2-fail on both earlier
variants. Reconstructed final passes42/42. Standard final outcomes, metrics
and full-state hashes are also checked against both variants; neither repair
is justified by a win-rate increase.

## Remaining scope and upkeep

NPC Voice still lacks the player's grounding erosion. Its food-equivalent
price and fallen-Voice weakness are real; grounding ownership, erosion,
food-conversion effects and mantle persistence require a separate person/office
audit. This is an unresolved cost-parity defect, not an exemption or proof of
complete Voice parity. Daily Voice support likewise retains its old player
recipient gap. Forty-context contest/army promises, fitting deeds and natural
titan/Network access are not completed here.

Rally Aura's old wrapper attaches after the base constructor's opening
scheduler. The new recipient proof does not certify every opening AI turn or
late-injected ally. Generic monster hesitation still attributes its narration
to fear_aura even when Voice supplied it; the phone replay exposes that
existing misleading line. Keep those follow-ups visible rather than changing
costs or duration to make the support appear balanced.

The automatically discovered runtime proof and SIMULATING.md's command
protocol are the maintenance hook. Update them with scheduler, status,
serialization, support-recipient or use-limit changes. Reproduce the retained
candidate from a fresh directory:

```text
node evidence/2026-10-16/player-command-verify.cjs --current
node evidence/2026-10-16/player-command-reconstruct.cjs after <fresh-directory>
node <fresh-directory>/scripts/godpath/test-player-command-turns.js
node scripts/balance-panel.js --root <fresh-directory> --n 64 --out <fresh-panel-directory> --par 8
node evidence/2026-10-16/player-command-probe.cjs <fresh-directory> maker 5 <trace.json.gz>
```

Reconstruction requires the pinned baseline commit locally; use `before` for
the original game and original villager assertion with the current negative
proof. Use `prototype` or `cursor-only` with the retained final proof to
reproduce the two incomplete restore contracts. Source bundles keep exact
bytes for all four runtime files, the
changed legacy assertion and the final proof itself, so later proof edits do
not change these reconstructions. All207 normalized manifest entries are
verified on reconstruction. Reconstructed roots have no own Git HEAD. Receipts
cover raw panels/jobs, probes/states, comparisons, tests and phone evidence;
LF attributes keep text hashes stable on Windows. Do not overwrite this
evidence when making a new policy or gameplay experiment.
The verifier defaults to retained historical inputs; `--current` also checks
the current test files against this unit's snapshots.
