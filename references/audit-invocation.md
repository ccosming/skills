# Audit invocation

After any workflow that creates or modifies files under `.spec/`, invoke
`/audit` via Task subagent to validate the result.

## Task pattern

````text
Task(subagent_type="general-purpose", description="audit <skill> output",
     prompt="Invoke the audit skill: Skill(skill=\"audit\", args=\"target_paths: <comma-separated paths>; caller_skill: /<skill>; caller_intent: <one-line description of what just happened>\"). Return ONLY its YAML output.")
````

Pass `target_paths` as a comma-separated list of every file touched in this
invocation. The caller decides scope; `/audit` audits exactly what is
listed.

## Caller obligations

Parse the YAML report. Apply per severity:

- **`error`** — blocks the success message to the user. Report findings,
  fix them or stop the workflow.
- **`warning`** — surface to the user as non-blocking notes after the
  success message.
- **`info`** — optional context, surface only if relevant to the user's
  next step.

## Skipping audit

`/audit` is not invoked when the workflow only reads `.spec/` files without
writing.
