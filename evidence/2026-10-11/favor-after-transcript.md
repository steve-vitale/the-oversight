# AFTER transcript — favor want (seed 20261011), robust favor system

The same scenario as BEFORE: a hungry villager opens a favor want.
Watch for: (1) a CONCRETE ask (not a contentless line), (2) "How can I help?"
deepening with WHY (not repeating the ask), (3) no commit -> "stated"
(not "engaged"), (4) "I'll do it" -> tracked obligation with deadline.

## Scenario 1: hear them out, walk away (no commit)

--- opening ---
NPC: "I hate to ask, but do you have anything to eat? Anything at all? I can't keep going like this. Don't look away from this."

--- your choices ---
  [gq:open:take] "What do you think?"
  [gq:open:unsure] "I don't know yet."
  [gq:open:honest_pass] "I'd rather not say."
  [joke] "Ha — yeah."
  [silence] "..."

--- after "How can I help?" (the WHY, not a repeat) ---
NPC: "I hate to ask, but do you have anything to eat? Anything at all? I can't keep going like this. Don't look away from this."

YOU: "What do you think?"

NPC: "I think the asking matters more than the answer, out here."

YOU: "How can I help?"

NPC: I haven't eaten right in days. I need food before I can't work at all.

--- your choices now ---
  [dlg:commit] "Count me in."
  [dlg:cant] "I'm sorry, I can't."
  [recap] "Wait — what were we talking about?"
  [teach] "Let me show you — I did this for a living."
  [dlg:subject] "Can I ask you something else?"
  [leave] "I should go."
  [silence] "..."

FINAL: resolution=stated (heard, not committed — NOT "engaged")
seed planted: {"wantId":"ask_favor","note":"the help they asked you for","day":1,"favorId":"favor-gen_lyzzr2f-1-1"}
obligation tracked: null

## Scenario 2: the next day — they remember (follow-up, not a reset)

--- opening (follow-up names the prior ask) ---
NPC: "About the food they needed — still need hands. Are you in?  Hm."

--- your choices (straight to commit/deflect — no re-ask) ---
  [gq:yn:yes] "Yes."
  [gq:yn:no] "No."
  [gq:yn:unsure] "I don't know."
  [gq:yn:honest_pass] "I'd rather not say."
  [silence] "..."

## Scenario 3: "I'll do it" — a real commitment

--- after hearing them out ---
NPC: "What? I'm past hungry — have you got anything to spare? Anything? I can't keep going like this."

YOU: "What do you think?"

NPC: "Fine — Short version: I don't know. Long version: also that, but slower."

YOU: "How can I help?"

NPC: I haven't eaten right in days. I'm slowing down — stupid, clumsy. Help me get back on my feet.

--- your choices ---
  [dlg:commit] "I'll do it."
  [dlg:cant] "I'm sorry, I can't."
  [recap] "Wait — what were we talking about?"
  [teach] "Let me show you — I did this for a living."
  [dlg:subject] "Can I ask you something else?"
  [leave] "I should go."
  [silence] "..."

--- after "I'll do it" ---
NPC: "What? I'm past hungry — have you got anything to spare? Anything? I can't keep going like this."

YOU: "What do you think?"

NPC: "Fine — Short version: I don't know. Long version: also that, but slower."

YOU: "How can I help?"

NPC: I haven't eaten right in days. I'm slowing down — stupid, clumsy. Help me get back on my feet.

YOU: "I'll do it."

NPC: "Thank you. I won't forget who fed me when it mattered."

FINAL: resolution=promised (explicit commit)
obligation tracked: {"goal":"feed","day":2,"kept":false,"favorId":"favor-gen_13i8qy3-2-2","favorTask":"share food with Rocco — they're past hungry","favorDeadline":3}
journal entry: {"text":"share food with Rocco — they're past hungry","status":"open","day":2}
