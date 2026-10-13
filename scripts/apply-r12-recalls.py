#!/usr/bin/env python3
# apply-r12-recalls.py — journey social r12 2026-10-13.
# Splices answer-specific `recalls` maps into src/data/characterGen.json for the
# remaining 17 no-recall questions (the <=27-ask long tail, measured by the r11
# ask-frequency probe: q_first_memory 27 down to q_name_day 19).
# Follows the r10/r11 splice style (unindented map entries, raw em-dashes per
# file style, no re-dump of the file). Opt-out answers (honest_opt_out) get NO
# recall entry (r10 rule).
# Run from the repo root. Asserts exactly-one-match per question.
import json, re, sys

RECALLS = {
 "q_first_memory": {
  "a_tell": "\"You told me about that kitchen — morning light, three years old. Have any other memories come back since?\"",
  "a_deflect": "\"You asked why I wanted to know, about your first memory. Fair question. I'm still curious, if you ever feel like telling it.\"",
 },
 "q_song": {
  "a_yes": "\"You've been singing in the creek. Badly, by your own admission. Heard anything worth stealing yet?\"",
  "a_no": "\"You said singing feels wrong, somehow. Does it still? Or has that moved?\"",
  "a_deflect": "\"You asked if I was going to sing. I won't. But if the creek ever tempts you, I'd listen.\"",
 },
 "q_change": {
  "a_tell": "\"You said you don't recognize the person in your head anymore. Still a stranger to yourself?\"",
  "a_vague": "\"You said you weren't sure this has changed you, whatever everyone says. Decided yet?\"",
  "a_deflect": "\"You said you were too busy surviving for an identity crisis. Still busy — or is there room for one now?\"",
 },
 "q_useful": {
  "a_hunger": "\"You said the most useful thing you learned is being hungry and going anyway. Still the lesson?\"",
  "a_self": "\"You said you'd learned you can do more than you thought. Proven it again since?\"",
 },
 "q_dream": {
  "a_before": "\"You said you dream about before. Every night — the only place it still exists. Is it still there?\"",
  "a_now": "\"You said the dreams are all this now. Still just here? Or has before come back?\"",
 },
 "q_fun": {
  "a_people": "\"You said fun was just being around your people. Do we count? Are we trying?\"",
  "a_hobby": "\"You had a whole thing — hobbies, projects. Ever think about starting one here?\"",
  "a_deflect": "\"You said fun feels like another lifetime. Has anything gotten close since?\"",
 },
 "q_system_fear": {
  "a_tell": "\"You said the scary part is this might be on purpose. That someone's watching. Believing it more or less these days?\"",
  "a_vague": "\"You said you're scared this will start feeling normal. Has it? Be honest.\"",
  "a_deflect": "\"You said everything, and moved on. Fair. But — still everything?\"",
 },
 "q_kindness": {
  "a_tell": "\"You told me about people sharing food they couldn't spare. Quiet. No performance. Seen it again since?\"",
  "a_vague": "\"You said you couldn't pick one kindest thing — probably luckier than you admit. Still lucky?\"",
  "a_deflect": "\"You said kindness feels like a setup now. Anyone changed your mind? Even a little?\"",
 },
 "q_guilty": {
  "a_tell": "\"You said yes — the worst thing. You didn't want to get into what. I won't ask. Just — are you carrying it any lighter?\"",
  "a_deflect": "\"You told me to define 'worst.' I still can't. The question stands, if you ever want it.\"",
 },
 "q_regret": {
  "a_tell": "\"You said there was something you needed to say, to someone, and now you can't. Found another way to say it yet?\"",
  "a_deflect": "\"You said regrets are a luxury now. If you had one to spend — still wouldn't?\"",
 },
 "q_hope": {
  "a_tell": "\"You wanted one full night's sleep — no waking up listening. Had it yet?\"",
  "a_vague": "\"You wanted something sweet — couldn't remember the last sweet thing. I'm keeping an eye out. That's a promise I'm saying out loud.\"",
  "a_deflect": "\"You said hope's a big word for small things. I'll keep the word small, then. What's the small thing today?\"",
 },
 "q_before_skill": {
  "a_tell": "\"You said patience was your old-life superpower — really waiting, without fidgeting. Still your answer?\"",
  "a_deflect": "\"You said your old life feels like a TV show you watched once. Any episodes worth rewatching?\"",
 },
 "q_left_behind": {
  "a_yes": "\"You said yes — you left someone behind. I never asked who. I won't. But I'm still here, asking nothing, if that helps.\"",
  "a_deflect": "\"You said everyone left someone behind. True. But you answered for everyone — not for you. I'll take it anyway.\"",
 },
 "q_believe": {
  "a_tell": "\"You said you believe we get through this — the alternative doesn't work. Still holding the line?\"",
  "a_vague": "\"You said you believe in breakfast. One day at a time. Did you get one today? Breakfast, I mean.\"",
  "a_deflect": "\"You said belief is for people with spare energy. Spare any yet? Even a little?\"",
 },
 "q_stay": {
  "a_tell": "\"You said you're staying — you didn't expect to say it, but you said it. Still true?\"",
  "a_deflect": "\"You asked if I'd heard something, when I asked if you're staying. I hadn't. But now I'm asking again — are you staying?\"",
 },
 "q_teach_me": {
  "a_tell": "\"You promised me one small useful thing. I'm still watching — lesson two, whenever you're ready.\"",
  "a_vague": "\"You said we're all guessing out here — you didn't know what you knew that I didn't. Has anything surfaced since?\"",
  "a_deflect": "\"You said you're not much of a teacher. You've been teaching all along, though. Badly, maybe. But still.\"",
 },
 "q_name_day": {
  "a_count": "\"You said you count the days — someone has to. What's the count today? Still keeping it?\"",
  "a_lost": "\"You'd lost track of the days too. Decided yet whether it matters?\"",
  "a_guess": "\"You said it's someday, probably. Still someday?\"",
 },
}

path = 'src/data/characterGen.json'
src = open(path, encoding='utf-8').read()

def find_obj_bounds(src, start):
    ob = src.rfind('{', 0, start)
    assert ob != -1
    depth = 0
    in_str = False
    esc = False
    i = ob
    while i < len(src):
        ch = src[i]
        if in_str:
            if esc: esc = False
            elif ch == '\\': esc = True
            elif ch == '"': in_str = False
        else:
            if ch == '"': in_str = True
            elif ch == '{': depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return ob, i
        i += 1
    raise AssertionError('unbalanced braces')

for qid, amap in RECALLS.items():
    start = src.find('"id": "%s"' % qid)
    assert start != -1, 'question not found: ' + qid
    ob, cb = find_obj_bounds(src, start)
    block = src[ob:cb+1]
    assert '"recalls"' not in block, 'already has recalls: ' + qid
    nl = src.rfind('\n', ob, cb)
    close_indent = src[nl+1:cb]
    assert close_indent.strip() == '', 'unexpected close-line: %r' % close_indent
    key_indent = close_indent + '  '
    prev = src[ob:nl].rstrip()
    sep = ',\n' if not prev.endswith(',') else '\n'
    entries = ',\n'.join('"%s": %s' % (aid, json.dumps(text, ensure_ascii=False)) for aid, text in amap.items())
    ins = sep + key_indent + '"recalls": {\n' + entries + '\n' + key_indent + '}'
    src = src[:nl] + ins + src[nl:]

open(path, 'w', encoding='utf-8').write(src)
print('spliced recalls into %d questions' % len(RECALLS))

data = json.load(open(path, encoding='utf-8'))
qs = {q['id']: q for q in data['convo']['questions']}
for qid, amap in RECALLS.items():
    got = qs[qid].get('recalls') or {}
    assert set(got.keys()) == set(amap.keys()), 'mismatch on ' + qid
print('verified: all %d questions have exact recall maps' % len(RECALLS))
