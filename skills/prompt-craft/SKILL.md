---
name: prompt-craft
description: >
  Compression discipline for LLM-targeted markdown. Apply when editing skill
  files, CLAUDE.md, system prompts, templates, or any markdown that becomes LLM
  context at runtime. Carries citable principles from Anthropic, OpenAI,
  DAIR.AI, and Google Vertex AI for compressing instruction prose without losing
  quality.
license: MIT
user-invocable: false
---

# Prompt Craft

Apply every principle below before saving any markdown that becomes LLM context
at runtime — skill files, CLAUDE.md, system prompts, templates, and equivalents.

## Principles

1. **Specificity over volume.** Replace adjective-loaded prose with a single
   measurable constraint.
   ([DAIR.AI](https://www.promptingguide.ai/introduction/tips))
   - Bad: "Be thorough and explore deeply before answering."
   - Good: "Before answering about a file, read it."

2. **Positive framing beats negation.** LLMs activate the concept they are told
   to avoid. Restate prohibitions as the desired behaviour where possible.
   ([DAIR.AI](https://www.promptingguide.ai/introduction/tips))
   - Bad: "Do not ask for personal info."
   - Good: "Use only the data already provided."

3. **One canonical rule per concept.** When the same rule appears in
   personality.md, step.md, and global.md, the model conflict-resolves
   unpredictably. Place the rule once (prefer `shared/global.md`) and delete
   paraphrases elsewhere.
   ([OpenAI GPT-4.1 Guide](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide))

4. **Constraint over philosophy.** Replace blanket adjectives ("be careful", "be
   thorough") with conditional triggers.
   ([Anthropic Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices))
   - Bad: "Be careful when editing."
   - Good: "Before editing a file, read it."

5. **Imperative voice without ALL CAPS.** Direct commands ("Do X.") are the
   recommended form. Capitalization, "MUST", "!!!" do not improve compliance.
   ([OpenAI GPT-4.1 Guide](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide))

6. **Output shape as a one-line schema.** Replace paragraphs describing format
   with a literal schema.
   ([Google Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/clear-instructions))
   - Bad: "Return a JSON object containing two arrays, one for drinks and one
     for food."
   - Good: "Return JSON: `{ drinks: [...], food: [...] }`."

7. **Examples replace abstract principles.** A concrete bad/good example carries
   the rule. Skip prose that restates what the example shows.
   ([Anthropic Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices))

8. **Place the canonical rule first.** Models attend most to start and end of
   the prompt; on very long files, repeat the critical rule at the end.
   ([OpenAI GPT-4.1 Guide](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide))

## Anti-patterns to detect before saving

- The same rule paraphrased twice in different files (sweep with `grep` across
  the workflow tree).
- The same rule paraphrased inside one bullet ("inferring X is welcome. Deciding
  Y is not.").
- Prose immediately after an example that restates what the example shows.
- Adjective phrases without a trigger ("be helpful", "carefully consider",
  "remain mindful").
- Negation chains without the positive counterpart.
- "Should", "might", "could" — replace with imperative.
- Prose describing JSON or markdown shape — show the schema instead.
- ALL CAPS, "MUST", "!!!", appeals to importance ("this is critical").

## Process

1. Draft normally.
2. Before saving, sweep the file once against each principle in order.
3. Run a quick `grep` for the rule's key terms across the surrounding directory
   (skill folder, CLAUDE.md, related files) to detect duplicates.
4. Format the file if the project has a formatter configured.

## Sources

- Anthropic — Prompting Best Practices:
  <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices>
- OpenAI — GPT-4.1 Prompting Guide:
  <https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide>
- DAIR.AI — Prompt Engineering Guide General Tips:
  <https://www.promptingguide.ai/introduction/tips>
- Google Vertex AI — Give Clear and Specific Instructions:
  <https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/clear-instructions>
