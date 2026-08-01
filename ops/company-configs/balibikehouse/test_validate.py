#!/usr/bin/env python3

import unittest

import validate as overlay


class BaliBikeHouseOverlayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.config = overlay.load_config()

    def test_complete_overlay_validates(self) -> None:
        overlay.validate(self.config)

    def test_manifest_has_twelve_roles_and_expected_empty_baseline(self) -> None:
        agents = self.config["agents"]
        self.assertEqual(len(agents), 12)
        self.assertEqual({agent["name"] for agent in agents}, overlay.EXPECTED_AGENT_NAMES)
        self.assertEqual(
            {
                agent["name"]
                for agent in agents
                if not agent["before"]["desiredSkills"]
            },
            overlay.EXPECTED_EMPTY_BEFORE,
        )

    def test_specialist_legacy_grants_cannot_bypass_explicit_deny(self) -> None:
        trusted = set(self.config["skillMutationPolicy"]["trustedAgentUrlKeys"])
        specialists = [
            agent for agent in self.config["agents"] if agent["urlKey"] not in trusted
        ]
        for agent in specialists:
            for action in overlay.CANONICAL_ACTIONS:
                with self.subTest(agent=agent["name"], action=action):
                    self.assertEqual(
                        overlay.evaluate_policy(
                            self.config,
                            principal_type="agent",
                            agent_id=agent["id"],
                            action=action,
                            legacy_grant=True,
                        ),
                        ("deny", "explicit:deny-other-agents"),
                    )

    def test_named_trusted_leads_are_explicitly_allowed(self) -> None:
        trusted = set(self.config["skillMutationPolicy"]["trustedAgentUrlKeys"])
        agents = [agent for agent in self.config["agents"] if agent["urlKey"] in trusted]
        self.assertEqual(len(agents), 3)
        for agent in agents:
            for action in overlay.CANONICAL_ACTIONS:
                with self.subTest(agent=agent["name"], action=action):
                    self.assertEqual(
                        overlay.evaluate_policy(
                            self.config,
                            principal_type="agent",
                            agent_id=agent["id"],
                            action=action,
                            legacy_grant=True,
                        ),
                        ("allow", "explicit:allow-named-trusted-leads"),
                    )

    def test_board_mutation_path_remains_allowed(self) -> None:
        self.assertEqual(
            overlay.evaluate_policy(
                self.config,
                principal_type="board",
                agent_id=None,
                action="skills.update",
            ),
            ("allow", "policy-default"),
        )

    def test_after_bundles_exclude_broad_operator_skills(self) -> None:
        for agent in self.config["agents"]:
            with self.subTest(agent=agent["name"]):
                self.assertFalse(
                    set(agent["after"]["desiredSkills"]) & overlay.BANNED_AFTER_SKILLS
                )

    def test_external_source_routine_gates_are_always(self) -> None:
        routines = self.config["routineInvariants"]
        self.assertEqual(len(routines), 3)
        self.assertEqual(
            {routine["activityGatePolicy"] for routine in routines}, {"always"}
        )


if __name__ == "__main__":
    unittest.main()
