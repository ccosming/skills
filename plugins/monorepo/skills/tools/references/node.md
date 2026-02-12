# Node.js

JavaScript runtime for server-side applications.

## Goal

Pin Node.js version for consistent runtime across the monorepo.

## Moon Integration

Add to `.moon/toolchains.yml`:

```yaml
node:
  version: '<from versions.json>'
```
