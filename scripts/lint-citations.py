#!/usr/bin/env python3
# Copyright 2026 Enzo Bossmann
# SPDX-License-Identifier: Apache-2.0
"""Advisory lint for legal-citation provenance in plugin skills.

This is a standalone advisory gate: it is NOT wired into test-cookbooks.sh yet.
Run it while triaging citation provenance regressions; wiring it into CI is a
follow-up once the current backlog of untagged citations is reviewed.

Flags prose assertions in */skills/*/SKILL.md that look like Brazilian legal
citations but do not carry an accepted provenance tag in the same paragraph or
list item. Exits non-zero with a file:line report for each offender; exits 0
with a per-file summary.
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
    r"\[(?:"
    r"model knowledge — verify|verify|verificar|verificar-pinpoint|settled|consolidado|"
    r"modelo conhecimento — verificar|review|"
    r"JusBrasil|Escavador|PJe|INPI|ANPD|Planalto|site do regulador|"
    r"user provided|fornecido pelo usuário|statute|premise flagged|jurisdiction|"
    r"busca web — verificar"
    r")",
    re.IGNORECASE,
)

ASSERTION = re.compile(
    r"\b("
    r"é|são|aplica(?:m|-se)?|prev[eê]|dispõe|estabelece|exige|obriga|permite|"
    r"pro[ií]be|veda|rege|regula|garante|assegura|deve(?:m)?|"
    r"tem direito|direito à?|prazo de|em até|obrigat[oó]ri[oa]|nula?|"
    r"v[aá]lid[ao]|"
    r"applies?|requires?|prohibits?|allows?|governs?|void|invalid|mandatory|"
    r"non-waivable"
    r")\b",
    re.IGNORECASE,
)

KEY_VALUE = re.compile(r"^\s*(?:[-*]\s+)?[A-Za-z_][\w.-]*\s*:\s+\S")
INLINE_KEY_VALUE = re.compile(r"^\s*(?:[-*]\s+)?`[A-Za-z_][\w.-]*\s*:\s+[^`]+`")
CODE_COMMENT = re.compile(r"^\s*(?:#|//)")
FENCE = re.compile(r"^\s*```")
TABLE_SEPARATOR = re.compile(r"^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$")
LIST_ITEM = re.compile(r"^\s*(?:[-*+]|\d+\.)\s+")
TASK_ITEM = re.compile(r"^\s*[-*+]\s+\[[ xX]\]")
DIRECTIVE_OR_QUESTION = re.compile(
    r"^\s*(?:[-*+]|\d+\.|>)?\s*(?:\*\*)?"
    r"(?:cite|citar|pesquisar|research|verifique|verificar|check|confirm|confirme|"
    r"read|ler|does|what|when|qual|quais|se\s+sim|if\s+yes|action)\b",
    re.IGNORECASE,
)
COMMAND_OPTION = re.compile(r"^\s*[-*]\s+`--[\w-]+`")
SKILL_DESCRIPTION = re.compile(r"\b(?:this|este|esta)\s+skill\b", re.IGNORECASE)


def is_assertive_citation(line: str) -> bool:
    citation = CITATION.search(line)
    if not citation:
        return False
    start = max(0, citation.start() - 90)
    end = min(len(line), citation.end() + 90)
    return bool(ASSERTION.search(line[start:end]))


def is_skippable_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped.startswith("#"):
        return True
    if CODE_COMMENT.match(line):
        return True
    if KEY_VALUE.match(line) or INLINE_KEY_VALUE.match(line):
        return True
    if TASK_ITEM.match(line) or COMMAND_OPTION.match(line) or DIRECTIVE_OR_QUESTION.match(line):
        return True
    if SKILL_DESCRIPTION.search(line):
        return True
    if stripped.endswith("?") or (stripped.startswith(("-", "*", ">", "|")) and "?" in stripped):
        return True
    if stripped.startswith("|") and (TABLE_SEPARATOR.match(line) or not is_assertive_citation(line)):
        return True
    return False


def is_boundary(line: str) -> bool:
    stripped = line.strip()
    return not stripped or stripped.startswith("#") or FENCE.match(line) or stripped == "---"


def is_same_text_block(lines: list[str], current: int, adjacent: int) -> bool:
    if any(is_boundary(line) for line in lines[min(adjacent, current) + 1 : max(adjacent, current)]):
        return False
    current_is_list = bool(LIST_ITEM.match(lines[current]))
    adjacent_is_list = bool(LIST_ITEM.match(lines[adjacent]))
    if current_is_list and adjacent_is_list and current != adjacent:
        return False
    if current_is_list:
        return adjacent == current or not adjacent_is_list
    if adjacent_is_list:
        return False
    return True


def line_has_nearby_provenance(lines: list[str], index: int) -> bool:
    for adjacent in range(max(0, index - 2), min(len(lines), index + 3)):
        if not is_same_text_block(lines, index, adjacent):
            continue
        if PROVENANCE.search(lines[adjacent]):
            return True
    return False


def is_untagged_citation(line: str, lines: list[str] | None = None, index: int = 0) -> bool:
    if is_skippable_line(line):
        return False
    if not is_assertive_citation(line):
        return False
    if lines is None:
        lines = [line]
        index = 0
    return not line_has_nearby_provenance(lines, index)


def lint_lines(lines: list[str]) -> list[int]:
    errs: list[int] = []
    in_front_matter = bool(lines and lines[0].strip() == "---")
    in_code_fence = False

    for index, line in enumerate(lines):
        stripped = line.strip()
        if index == 0 and in_front_matter:
            continue
        if in_front_matter:
            if stripped == "---":
                in_front_matter = False
            continue
        if FENCE.match(line):
            in_code_fence = not in_code_fence
            continue
        if in_code_fence:
            continue
        if is_untagged_citation(line, lines, index):
            errs.append(index + 1)
    return errs


def main() -> int:
    skills = sorted({*ROOT.glob("skills/*/SKILL.md"), *ROOT.glob("*/skills/*/SKILL.md")})
    if not skills:
        print(f"no skill files found under {ROOT}", file=sys.stderr)
        return 2
    errs: list[str] = []
    clean: list[str] = []
    for skill in skills:
        file_errs = []
        lines = skill.read_text().splitlines()
        flagged_lines = set(lint_lines(lines))
        for lineno, line in enumerate(lines, start=1):
            if lineno in flagged_lines:
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
            "\nAccepted nearby tags include [model knowledge — verify], [modelo conhecimento — verificar], "
            "[verify], [verificar], [settled], [consolidado], [JusBrasil], [Escavador], "
            "[PJe], [INPI], [ANPD], [Planalto], [user provided], [fornecido pelo usuário], "
            "[statute], [jurisdiction — verify], and [premise flagged].",
            file=sys.stderr,
        )
        return 1
    for skill in clean:
        print(f"  ✓ {skill}")
    return 0


if __name__ == "__main__":
    assert not is_untagged_citation("CPC art. 219 [model knowledge — verify]")
    assert is_untagged_citation("CPC art. 219 estabelece prazo em dias úteis")
    assert not is_untagged_citation("`lgpd_art20: true` — direito a revisão (LGPD Art. 20)")
    assert not lint_lines(["---", "description: LGPD Art. 20", "---"])
    assert not lint_lines(["```yaml", "lgpd_art20: true # LGPD Art. 20 prevê revisão", "```"])
    assert not lint_lines(["# LGPD Art. 20"])
    assert not lint_lines(["LGPD Art. 20 prevê revisão.", "[verificar]"])
    assert lint_lines(["- LGPD Art. 20 prevê revisão.", "- [verificar] outro item"]) == [1]
    assert not lint_lines(["- Essa IA trata dado pessoal? (Se sim, LGPD Art. 20 se aplica.)"])
    assert not lint_lines(["- [ ] Dados sensíveis (Art. 11 LGPD) são rotina?"])
    assert not lint_lines(["- `--respond` checks whether art. 19 requires a court order."])
    assert lint_lines(["LGPD Art. 20 prevê revisão."]) == [1]
    sys.exit(main())
