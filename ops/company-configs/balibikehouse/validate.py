#!/usr/bin/env python3
"""Validate and summarize the source-only BaliBikeHouse Paperclip overlay."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"

CANONICAL_ACTIONS = {
    "skills.create",
    "skills.import",
    "skills.install",
    "skills.edit",
    "skills.update",
    "skills.test",
    "skills.reset",
    "skills.remove",
}

EXPECTED_AGENT_NAMES = {
    "Backend Engineer",
    "CEO",
    "CMO",
    "Communications Manager",
    "Content Lead",
    "Content Operator",
    "Content QA-QC",
    "Data Analyst",
    "Frontend Engineer",
    "Product Owner",
    "Tech Lead",
    "Tech QA-QC",
}

EXPECTED_EMPTY_BEFORE = {
    "CEO",
    "CMO",
    "Content Lead",
    "Content Operator",
    "Content QA-QC",
}

BANNED_AFTER_SKILLS = {
    "diagnose-why-work-stopped",
    "paperclip-create-agent",
    "paperclip-create-plugin",
    "paperclip-dev",
    "para-memory-files",
    "terminal-bench-loop",
}

WORKFLOW_MARKERS = {
    "routable unblock owner",
    "exact unblock action",
    "decomposition history",
    "work product",
    "exact pr/mr head",
    "do not poll ci",
}


class ValidationError(Exception):
    """Raised when the overlay is incomplete or internally inconsistent."""


def load_config() -> dict[str, Any]:
    with CONFIG_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def _frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(?P<body>.*?)\n---\n", text, re.DOTALL)
    _require(match is not None, f"missing YAML frontmatter: {path.relative_to(ROOT)}")
    result: dict[str, str] = {}
    for line in match.group("body").splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip()
    return result


def _library_slugs(config: dict[str, Any]) -> set[str]:
    library = config["libraryPlan"]
    return {
        *(entry["slug"] for entry in library["catalogInstall"]),
        *(entry["slug"] for entry in library["managedUpdate"]),
        *(entry["slug"] for entry in library["managedCreate"]),
        *library["existingSkillSlugs"],
    }


def _matches_subject(
    subject: dict[str, Any], principal_type: str, agent_id: str | None
) -> bool:
    subject_type = subject.get("type")
    if subject_type == "agents":
        return principal_type == "agent" and agent_id in subject.get("agentIds", [])
    if subject_type == "all_agents":
        return principal_type == "agent"
    if subject_type == "board":
        return principal_type == "board"
    return False


def evaluate_policy(
    config: dict[str, Any],
    *,
    principal_type: str,
    agent_id: str | None,
    action: str,
    legacy_grant: bool = False,
) -> tuple[str, str]:
    """Evaluate explicit rules before any legacy grant fallback."""

    payload = config["skillMutationPolicy"]["apiPayload"]
    for rule in sorted(payload["rules"], key=lambda item: item["priority"]):
        if action in rule["actions"] and _matches_subject(
            rule["subject"], principal_type, agent_id
        ):
            return rule["effect"], f"explicit:{rule['id']}"

    if (
        principal_type == "agent"
        and payload["defaultEffect"] == "deny"
        and legacy_grant
    ):
        return "allow", "legacy-grant-fallback"
    return payload["defaultEffect"], "policy-default"


def validate(config: dict[str, Any]) -> None:
    _require(config.get("schemaVersion") == 1, "schemaVersion must be 1")
    _require(config.get("paperclipRelease") == "2026.609", "release must be 2026.609")
    _require(
        re.fullmatch(r"[0-9a-f]{40}", config.get("sourceBaseSha", "")) is not None,
        "sourceBaseSha must be a full git SHA",
    )

    agents = config.get("agents", [])
    _require(len(agents) == 12, "manifest must contain exactly 12 agents")
    names = [agent.get("name") for agent in agents]
    ids = [agent.get("id") for agent in agents]
    url_keys = [agent.get("urlKey") for agent in agents]
    _require(set(names) == EXPECTED_AGENT_NAMES, "12-agent role set is incomplete")
    _require(len(set(ids)) == len(ids), "agent ids must be unique")
    _require(len(set(url_keys)) == len(url_keys), "agent urlKeys must be unique")

    empty_before = {
        agent["name"]
        for agent in agents
        if not agent.get("before", {}).get("desiredSkills", [])
    }
    _require(
        empty_before == EXPECTED_EMPTY_BEFORE,
        f"unexpected empty before sets: {sorted(empty_before)}",
    )

    available = _library_slugs(config)
    for agent in agents:
        after = agent.get("after", {}).get("desiredSkills", [])
        _require(after, f"{agent['name']} has an empty after set")
        _require(len(after) == len(set(after)), f"{agent['name']} has duplicate skills")
        unresolved = set(after) - available
        _require(not unresolved, f"{agent['name']} has unresolved skills: {sorted(unresolved)}")
        banned = {
            skill
            for skill in after
            if skill in BANNED_AFTER_SKILLS
            or skill.rsplit("/", 1)[-1] in BANNED_AFTER_SKILLS
        }
        _require(not banned, f"{agent['name']} retains broad skills: {sorted(banned)}")

    library = config["libraryPlan"]
    catalog = library["catalogInstall"]
    _require(len(catalog) == 3, "exactly three catalog installs are expected")
    _require(len(library["managedUpdate"]) == 3, "exactly three skill updates are expected")
    _require(len(library["managedCreate"]) == 3, "exactly three skill creates are expected")

    managed = library["managedUpdate"] + library["managedCreate"]
    for entry in managed:
        path = ROOT / entry["source"]
        _require(path.is_file(), f"missing managed skill source: {entry['source']}")
        metadata = _frontmatter(path)
        _require(metadata.get("name") == entry["slug"], f"skill name mismatch: {entry['source']}")
        _require(bool(metadata.get("description")), f"missing skill description: {entry['source']}")

    for entry in library["managedUpdate"]:
        text = (ROOT / entry["source"]).read_text(encoding="utf-8").lower()
        missing = WORKFLOW_MARKERS - {marker for marker in WORKFLOW_MARKERS if marker in text}
        _require(not missing, f"{entry['slug']} misses workflow markers: {sorted(missing)}")

    policy = config["skillMutationPolicy"]
    payload = policy["apiPayload"]
    _require(payload.get("schemaVersion") == 1, "policy schemaVersion must be 1")
    _require(payload.get("defaultEffect") == "allow", "board path requires open default")
    rules = payload.get("rules", [])
    _require(len(rules) == 2, "policy must contain one trusted allow and one agent deny")
    _require(len({rule["priority"] for rule in rules}) == len(rules), "policy priorities must be unique")
    for rule in rules:
        _require(set(rule.get("actions", [])) == CANONICAL_ACTIONS, f"incomplete actions in {rule['id']}")

    trusted_ids = {
        agent["id"] for agent in agents if agent["urlKey"] in policy["trustedAgentUrlKeys"]
    }
    allow_rule = next(rule for rule in rules if rule["id"] == "allow-named-trusted-leads")
    deny_rule = next(rule for rule in rules if rule["id"] == "deny-other-agents")
    _require(set(allow_rule["subject"]["agentIds"]) == trusted_ids, "trusted agent ids drifted")
    _require(allow_rule["priority"] < deny_rule["priority"], "trusted allow must precede all-agent deny")
    _require(deny_rule["subject"] == {"type": "all_agents"}, "specialist deny must cover all agents")

    for agent in agents:
        is_trusted = agent["id"] in trusted_ids
        for action in CANONICAL_ACTIONS:
            effect, reason = evaluate_policy(
                config,
                principal_type="agent",
                agent_id=agent["id"],
                action=action,
                legacy_grant=True,
            )
            expected = "allow" if is_trusted else "deny"
            _require(effect == expected, f"policy mismatch for {agent['name']} {action}")
            _require(reason.startswith("explicit:"), f"legacy grant bypass for {agent['name']} {action}")

    board_effect, board_reason = evaluate_policy(
        config,
        principal_type="board",
        agent_id=None,
        action="skills.update",
    )
    _require((board_effect, board_reason) == ("allow", "policy-default"), "board mutation path is not allowed")

    routines = config.get("routineInvariants", [])
    _require(len(routines) == 3, "exactly three routine invariants are required")
    _require(len({routine["id"] for routine in routines}) == 3, "routine ids must be unique")
    _require(
        all(routine.get("activityGatePolicy") == "always" for routine in routines),
        "all external-source routines must retain activityGatePolicy always",
    )


def dry_run_summary(config: dict[str, Any]) -> dict[str, Any]:
    validate(config)
    library = config["libraryPlan"]
    trusted = set(config["skillMutationPolicy"]["trustedAgentUrlKeys"])
    return {
        "mode": "source-only-no-api-calls",
        "release": config["paperclipRelease"],
        "sourceBaseSha": config["sourceBaseSha"],
        "library": {
            "catalogInstall": len(library["catalogInstall"]),
            "managedUpdate": len(library["managedUpdate"]),
            "managedCreate": len(library["managedCreate"]),
        },
        "agentSync": {
            "agents": len(config["agents"]),
            "emptyBefore": sorted(EXPECTED_EMPTY_BEFORE),
            "nonemptyAfter": sum(
                bool(agent["after"]["desiredSkills"]) for agent in config["agents"]
            ),
        },
        "policy": {
            "trustedLeads": sorted(trusted),
            "specialistLegacyGrantBypass": False,
            "canonicalActions": len(CANONICAL_ACTIONS),
        },
        "routineAssertions": len(config["routineInvariants"]),
    }


def main(argv: list[str]) -> int:
    command = argv[1] if len(argv) > 1 else "validate"
    try:
        config = load_config()
        if command == "validate":
            validate(config)
            print("BAL overlay valid: 12 agents, 6 managed skills, 3 routine invariants")
        elif command == "skill-sync-dry-run":
            print(json.dumps(dry_run_summary(config), indent=2, sort_keys=True))
        else:
            print(f"unknown command: {command}", file=sys.stderr)
            return 2
    except (OSError, json.JSONDecodeError, KeyError, StopIteration, ValidationError) as error:
        print(f"validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
