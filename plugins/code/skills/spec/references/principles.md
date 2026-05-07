# Principles

Reference for the `code` plugin's spec interview. Encodes the user's transversal engineering principles. The skill consults this file as the philosophical frame when proposing or filtering options across the rest of the references.

| Principle                        | What it means                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Boring tech first                | Prefer mature, well-understood tools over cutting-edge unless the use case demands otherwise              |
| Simplicity over cleverness       | Write code a junior can understand in 6 months without context                                            |
| YAGNI                            | Build what's needed now, not what might be needed; no speculative features                                |
| Type safety where it pays        | Strict types at boundaries; pragmatic inside hot loops                                                    |
| Tests by value, not completeness | Coverage where bugs hurt, not for the metric; integration > unit when both apply                          |
| Explicit over implicit           | Explicit dependencies, returns, and errors; no magic                                                      |
| Refactor in flow                 | Small refactors as you touch code; avoid big-bang rewrites                                                |
| Match abstraction to complexity  | DDD/hexagonal for complex domains; layered for simple ones                                                |
| Honest naming                    | Names describe what is, not what was or what might be                                                     |
| Code locality                    | Keep related things together; resist premature extraction across files                                    |
| AI-friendly readability          | Code that is clear for both human and LLM readers: explicit names, small functions, predictable structure |
