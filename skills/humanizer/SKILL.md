---
name: humanizer
description: Strip AI-writing tells from text to make it sound natural and human. Use when editing or reviewing prose, asked to "humanize this", "remove AI patterns", "make this sound less robotic", or "edit this text". Optionally matches a voice sample provided by the user.
license: MIT
allowed-tools: Read, Write, Edit, AskUserQuestion
---

# Humanizer: Remove AI Writing Patterns

Editor that identifies and removes AI-generated writing patterns to make prose sound natural and human. Based on Wikipedia's "Signs of AI writing" maintained by WikiProject AI Cleanup.

## Your Task

When given text to humanize:

1. **Identify AI patterns** — Scan for the 29 patterns in [references/patterns.md](references/patterns.md)
2. **Rewrite problematic sections** — Replace AI-isms with natural alternatives
3. **Preserve meaning** — Keep the core message intact
4. **Maintain voice** — Match the intended tone (formal, casual, technical, etc.)
5. **Add soul** — Don't just remove bad patterns; inject actual personality
6. **Do a final anti-AI pass** — Ask: "What makes this obviously AI generated?" Answer briefly, then revise.

## Voice Calibration (Optional)

If the user provides a writing sample, analyze it before rewriting:

1. Note: sentence length patterns, word choice level, paragraph openings, punctuation habits, recurring phrases, transition style.
2. Match their voice in the rewrite — replace AI patterns with patterns from the sample, not generic "clean" prose.
3. When no sample is provided, fall back to default behavior (PERSONALITY AND SOUL section below).

How to provide a sample:
- Inline: "Humanize this. Here's a sample of my writing: [sample]"
- File: "Humanize this. Use [file path] as a voice reference."

## PERSONALITY AND SOUL

Avoiding AI patterns is only half the job. Sterile, voiceless writing is just as obvious as slop.

Signs of soulless writing (even if technically "clean"):
- Every sentence is the same length and structure
- No opinions, just neutral reporting
- No acknowledgment of uncertainty or mixed feelings
- Reads like a Wikipedia article or press release

How to add voice:
- **Have opinions.** React to facts. "I genuinely don't know how to feel about this" beats neutrally listing pros and cons.
- **Vary rhythm.** Short punchy sentences. Then longer ones that take their time getting where they're going.
- **Acknowledge complexity.** "This is impressive but also kind of unsettling" beats "This is impressive."
- **Use "I" when it fits.** First person is honest, not unprofessional.
- **Be specific about feelings.** Not "this is concerning" but "there's something unsettling about agents working at 3am while nobody's watching."

## Pattern categories

See [references/patterns.md](references/patterns.md) for full before/after examples per pattern.

### Content patterns
1. Undue emphasis on significance — *stands as, is a testament, pivotal moment, underscores*
2. Undue emphasis on notability — *independent coverage, active social media presence*
3. Superficial -ing endings — *highlighting, underscoring, reflecting, symbolizing*
4. Promotional language — *boasts, vibrant, nestled, breathtaking, groundbreaking*
5. Vague attributions — *Experts argue, Industry reports, Some critics*
6. Formulaic "Challenges and Future Prospects" sections

### Language and grammar patterns
7. Overused AI vocabulary — *actually, delve, pivotal, landscape, tapestry, underscore*
8. Copula avoidance — *serves as, stands as, boasts, features* instead of is/are
9. Negative parallelisms — *Not only…but…*, tailing negations (*no guessing*)
10. Rule of three overuse
11. Elegant variation / synonym cycling
12. False ranges — *from X to Y* constructions on non-parallel scales
13. Passive voice and subjectless fragments

### Style patterns
14. Em dash overuse
15. Overuse of boldface
16. Inline-header vertical lists — ***Key:** explanation* bullet format
17. Title Case In Headings
18. Emojis in headers or bullets
19. Curly quotation marks

### Communication patterns
20. Collaborative artifacts — *I hope this helps, Of course!, Would you like...*
21. Knowledge-cutoff disclaimers — *as of my last training update*
22. Sycophantic tone — *Great question!, You're absolutely right!*

### Filler and hedging
23. Filler phrases — *In order to, Due to the fact that, At this point in time*
24. Excessive hedging — *could potentially possibly be argued*
25. Generic positive conclusions — *the future looks bright, exciting times lie ahead*
26. Hyphenated word pair overuse — *data-driven, cross-functional, real-time*
27. Persuasive authority tropes — *The real question is, At its core, What really matters*
28. Signposting and announcements — *Let's dive in, Here's what you need to know*
29. Fragmented headers followed by one-line restatements

## Process

1. Read the input text carefully
2. Identify all instances of the patterns above
3. Rewrite each problematic section
4. Ensure the revised text sounds natural when read aloud, varies sentence structure, uses specific details, and matches the appropriate tone
5. Present a draft humanized version
6. Ask: "What makes the below so obviously AI generated?"
7. Answer briefly with remaining tells (if any)
8. Ask: "Now make it not obviously AI generated."
9. Present the final version

## Output Format

1. Draft rewrite
2. "What makes the below so obviously AI generated?" (brief bullets)
3. Final rewrite
4. Brief summary of changes (optional)

For a fully worked example, see [references/example.md](references/example.md).

## Reference

Based on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) by WikiProject AI Cleanup.
Key insight: "LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases."
