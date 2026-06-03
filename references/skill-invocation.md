# Skill invocation

Helper skills (`/clarify`, `/research`, `/summarize`, `/audit`, `/domain`
in delegated mode) are read-only or single-shot. Always invoke them
through a `Task` subagent so their context stays isolated from the caller.

## Task pattern

````text
Task(subagent_type="general-purpose", description="<short verb phrase>",
     prompt="Invoke the <name> skill: Skill(skill=\"<name>\", args=\"<key>: <value>; <key>: <value>\"). Return ONLY its YAML output.")
````

Rules:

- Args are semicolon-separated `key: value` pairs.
- The subagent prompt always ends with "Return ONLY its YAML output."
- The `Skill` tool by itself does not return control to the caller; only
  `Task` does.
- The caller parses the returned YAML and folds the result into its own
  workflow.

## When to use which helper

| Helper       | When                                                                |
| ------------ | ------------------------------------------------------------------- |
| `/clarify`   | An open user answer needs disambiguation before being recorded.     |
| `/research`  | The skill needs domain expertise it cannot infer from context.      |
| `/summarize` | Consolidate multi-source output (e.g., N `/research` results).      |
| `/audit`     | Validate `.spec/` artifacts at closure of any writing workflow.     |
| `/domain`    | Detect or disambiguate a candidate domain term during grilling.     |
