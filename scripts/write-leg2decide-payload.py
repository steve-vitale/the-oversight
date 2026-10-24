#!/usr/bin/env python3
# write-leg2decide-payload.py — single-attempt payload writer for sim-leg2decide-b.
#
# CRITICAL CONSTRAINT (proven 2026-10-24): the container EPERM flap is
# PROCESS-SCOPED — a process spawned during a bad window can never write,
# no matter how long it retries, while a process spawned during a good
# window writes fine. In-process retry loops are therefore USELESS here.
# The correct retry unit is a FRESH PROCESS per attempt: the caller
# (leg2decide-capture3.sh) holds the payload in shell memory and spawns
# this writer anew until one lands. This writer itself attempts each file
# ONCE (temp + rename, never a direct write onto a possibly-poisoned
# 0-byte file) and exits 0/1 so the caller can retry with a fresh process.
#
# Input: payload JSON in env LEG2DECIDE_PAYLOAD (required); sweep JSON in
# env LEG2DECIDE_SWEEP (optional, best effort).
# Usage: LEG2DECIDE_PAYLOAD='<json>' [LEG2DECIDE_SWEEP='<json>'] \
#   python3 scripts/write-leg2decide-payload.py <final-dir> <anchor-sha> <side> <seed>
# Exit 0 = per-seed file valid on disk (written or already valid);
# exit 1 = write failed (caller retries with a FRESH process).
import json
import os
import sys

FINAL, ANCHOR, SIDE, SEED = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
SHORT = ANCHOR[:8]
NAME = 'leg2drift-b-%s-%s-dg1-leadfeast-s%d.json' % (SHORT, SIDE, SEED)
SWEEP_NAME = 'sweep-%s-%s-dg1-leadfeast.json' % (SHORT, SIDE)
PAYLOAD = os.environ.get('LEG2DECIDE_PAYLOAD', '')
SWEEP = os.environ.get('LEG2DECIDE_SWEEP', '')


def valid(path):
    try:
        with open(path) as f:
            d = json.load(f)
        return d['anchorCommit'] == ANCHOR and d['seed'] == SEED
    except Exception:  # noqa: BLE001 — any problem means not valid
        return False


def write_once(path, data):
    # Single attempt, temp + rename (fresh inode; rename replaces any
    # poisoned 0-byte file at the target). No retries here — the CALLER
    # retries by spawning a fresh process (see header).
    tmp = '%s.tmp-w-%d' % (path, os.getpid())
    try:
        with open(tmp, 'w') as f:
            f.write(data)
        with open(tmp, 'r') as f:
            back = f.read()
        if len(back) != len(data):
            raise IOError('readback length mismatch')
        os.rename(tmp, path)
        return True
    except Exception as e:  # noqa: BLE001
        try:
            os.unlink(tmp)
        except Exception:  # noqa: BLE001
            pass
        print('WRITE-ATTEMPT-FAILED %s: %s' % (os.path.basename(path), e), file=sys.stderr)
        return False


def main():
    if not PAYLOAD:
        print('NO-PAYLOAD (env LEG2DECIDE_PAYLOAD empty)', file=sys.stderr)
        return 1
    try:
        d = json.loads(PAYLOAD)
    except Exception:  # noqa: BLE001
        print('BAD-PAYLOAD (not JSON)', file=sys.stderr)
        return 1
    if d.get('anchorCommit') != ANCHOR or d.get('seed') != SEED:
        print('MISMATCH (anchor/seed differ from expected)', file=sys.stderr)
        return 1
    dest = os.path.join(FINAL, NAME)
    if valid(dest):
        print('ALREADY-VALID %s' % NAME, file=sys.stderr)
        return 0
    if not write_once(dest, PAYLOAD):
        return 1
    if not valid(dest):
        print('POST-WRITE-INVALID %s' % NAME, file=sys.stderr)
        return 1
    print('WROTE %s' % NAME, file=sys.stderr)
    if SWEEP:
        try:
            json.loads(SWEEP)
            write_once(os.path.join(FINAL, SWEEP_NAME), SWEEP)
        except Exception:  # noqa: BLE001
            pass  # sweep summaries are report-only, never fatal
    return 0


sys.exit(main())
