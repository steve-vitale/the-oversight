#!/usr/bin/env python3
# apply-r11-recalls.py — journey social r11 2026-10-13.
# Splices answer-specific `recalls` maps into src/data/characterGen.json for the
# 11 no-recall questions at or above the r11 ask-frequency top tier (>=28 asks
# across 6 seeds x 60d, measured by journey-social-r11-askfreq-20261013.js).
# Follows the r10 splice style (unindented map entries, `},` + `"recall": null,`
# retained). Opt-out answers get NO recall entry (r10 rule).
# Run from the repo root. Asserts exactly-one-match per question.
import json, re, sys

RECALLS = {
 "q_night": {
  "a_yes": "\"You heard the sounds past the treeline too, that night. They haven't stopped, have they?\"",
  "a_no": "\"You said you slept fine that night, heard nothing. I still envy that.\"",
  "a_joke": "\"You said it was just the wind. Probably. I'm still not sure 'probably' covers it.\"",
 },
 "q_quiet": {
  "a_kind": "\"You said you're not good at the talking part either. For what it's worth — you're doing fine.\"",
  "a_help": "\"You asked what I needed, that time I couldn't get the words out. It helped. It did.\"",
 },
 "q_read": {
  "a_honest": "\"You said you're still figuring everyone out. Figure anything out yet? Anyone you're watching?\"",
  "a_name": "\"You gave me a name to watch, once. I've been watching.\"",
  "a_none": "\"You said you don't gossip about people. I've been trying to hold that line. It's hard.\"",
 },
 "q_skill": {
  "a_tell": "\"You said you're better with your hands than people expect. I've been waiting to see.\"",
  "a_vague": "\"You said you'd either show your hidden card or you wouldn't. Still waiting on the reveal.\"",
  "a_deflect": "\"You said nothing worth mentioning. Nobody believes that one, you know.\"",
 },
 "q_alone_time": {
  "a_tell": "\"You take those walks that don't need to happen. Still breathing your own air?\"",
  "a_vague": "\"You said the quiet scares you more than the crowd. Still true?\"",
  "a_deflect": "\"You said alone is how you get got. I've been thinking about that. You might be right.\"",
 },
 "q_laugh_memory": {
  "a_tell": "\"You told me about the stolen laugh — someone tripping over nothing. Have you stolen any more since?\"",
  "a_vague": "\"You couldn't remember the last time you laughed. Did you ever come up with one?\"",
  "a_deflect": "\"You said laughing feels wrong now. I keep wondering if it still does.\"",
 },
 "q_first_week": {
  "a_shock": "\"You said shock got you through the first week. Just kept moving. What's carrying you now?\"",
  "a_person": "\"You said one person kept you going, that first week. Are they still here? Still keeping you going?\"",
 },
 "q_fight": {
  "a_tell": "\"You told me yes, once. No details. I haven't forgotten. I just don't ask.\"",
  "a_vague": "\"You dodged with philosophy — 'define hurt.' I've been defining it ever since.\"",
  "a_deflect": "\"You said that's not a question you ask people. You were right. I haven't asked it since.\"",
 },
 "q_laugh": {
  "a_story": "\"That thing you told me — the funny one, when I was desperate for it. I still think about it.\"",
  "a_dark": "\"You said the fact that we're alive is pretty funny. Gallows humor. Still holding?\"",
 },
 "q_someone": {
  "a_tell": "\"You said there's someone you don't trust. You never said who. Do you trust them any more now?\"",
  "a_vague": "\"You said you didn't know anyone well enough to distrust yet. Know us well enough now?\"",
  "a_deflect": "\"You said that was a dangerous question. I've been careful who I ask since.\"",
 },
 "q_angry": {
  "a_yes": "\"You said you were furious. Most days. Still carrying it?\"",
  "a_tired": "\"You said you were too tired to be angry. Rested any since?\"",
  "a_deflect": "\"You said anger doesn't help. I've been testing that theory. Jury's out.\"",
 },
}

path = 'src/data/characterGen.json'
src = open(path, encoding='utf-8').read()

def find_obj_bounds(src, start):
    # enclosing object's opening brace (scan back from the "id" line start)
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
    # locate the question object via brace matching (handles both the
    # "recall": null form and questions with no recall key at all)
    start = src.find('"id": "%s"' % qid)
    assert start != -1, 'question not found: ' + qid
    ob, cb = find_obj_bounds(src, start)
    block = src[ob:cb+1]
    assert '"recalls"' not in block, 'already has recalls: ' + qid
    # insert the recalls key just before the object's closing brace
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

# verify JSON still parses and all entries present
data = json.load(open(path, encoding='utf-8'))
qs = {q['id']: q for q in data['convo']['questions']}
for qid, amap in RECALLS.items():
    got = qs[qid].get('recalls') or {}
    assert set(got.keys()) == set(amap.keys()), 'mismatch on ' + qid
print('verified: all %d questions have exact recall maps' % len(RECALLS))
