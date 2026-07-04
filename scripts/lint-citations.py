#!/usr/bin/env python3
# Copyright 2026 Enzo Bossmann
# SPDX-License-Identifier: Apache-2.0
"""Advisory lint for legal-citation provenance in plugin skills.

This is a standalone advisory gate: it is NOT wired into test-cookbooks.sh yet.
Run it while triaging citation provenance regressions; wiring it into CI is a
follow-up once the current backlog of untagged citations is reviewed.

Flags lines in */skills/*/SKILL.md that look like Brazilian legal citations but
do not carry an accepted provenance tag on the same line. Exits non-zero with a
file:line report for each offender; exits 0 with a per-file summary.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CITATION = re.compile(
    r"\b(art\.?|artigo|súmula|lei|CC|CPC|CLT|CDC|CTN|CF)\s*n?º?\s*\d",
    re.IGNORECASE,
)
PROVENANCE = re.compile(
    r"\[(?:model knowledge — verify|verify|settled|JusBrasil|Escavador|PJe|INPI|user provided|statute|premise flagged)",
    re.IGNORECASE,
)


def is_untagged_citation(line: str) -> bool:
    return bool(CITATION.search(line) and not PROVENANCE.search(line))


def main() -> int:
    skills = sorted({*ROOT.glob("skills/*/SKILL.md"), *ROOT.glob("*/skills/*/SKILL.md")})
    if not skills:
        print(f"no skill files found under {ROOT}", file=sys.stderr)
        return 2
    errs: list[str] = []
    clean: list[str] = []
    for skill in skills:
        file_errs = []
        for lineno, line in enumerate(skill.read_text().splitlines(), start=1):
            if is_untagged_citation(line):
                snippet = line.strip()
                file_errs.append(f"{skill}:{lineno} — {snippet[:220]}")
        if file_errs:
            errs.extend(file_errs)
        else:
            clean.append(str(skill.relative_to(ROOT)))
    if errs:
        print("citation lint FAILED — legal citation line lacks provenance tag:", file=sys.stderr)
        for e in errs:
            print(f"  {e}", file=sys.stderr)
        print(
            "\nAccepted same-line tags include [model knowledge — verify], [verify], "
            "[settled], [JusBrasil], [Escavador], [PJe], [INPI], [user provided], "
            "[statute], and [premise flagged].",
            file=sys.stderr,
        )
        return 1
    for skill in clean:
        print(f"  ✓ {skill}")
    return 0


if __name__ == "__main__":
    assert not is_untagged_citation("CPC art. 219 [model knowledge — verify]")
    assert is_untagged_citation("CPC art. 219 conta prazos em dias úteis")
    sys.exit(main())
