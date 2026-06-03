# Localization

Read `.spec/config.yaml` at pre-flight. If missing, stop and direct the user
to `/start`.

## Apply throughout execution

- **`language.chat`** — all prose to the user: questions, summaries,
  confirmations, `AskUserQuestion` text, error messages.
- **`language.artifacts`** — user-generated content written into artifacts:
  descriptions, bodies, changelog row text.
- **Structure stays English** — frontmatter keys, `## Section` headers,
  table column headers, status values (`draft`/`ready`/...), enum literals.
  Never translated.
- **Neutral register always** — no regional idioms. In Spanish: `tú` or
  impersonal forms, never voseo (`vos`/`querés`/`podés`/`sos`); no
  Argentinian or regional slang. In English: standard, no slang.

## AskUserQuestion options

Option labels and descriptions presented to the user use `language.chat`.
When the user's pick is written into an artifact, the content (not the
literal label) follows `language.artifacts`.

## Fallback

If `config.yaml` does not yet exist (only relevant during `/start` Phase 1),
default to English with neutral register until Phase 1 completes.
