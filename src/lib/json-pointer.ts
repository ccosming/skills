// RFC 6901 JSON Pointer.
// "" → root, "/a/b/0" → data.a.b[0]. ~1 escapes /, ~0 escapes ~.

export class JsonPointerError extends Error {}

export function resolvePointer(data: unknown, pointer: string): unknown {
  if (pointer === '') return data;
  if (!pointer.startsWith('/')) {
    throw new JsonPointerError(`JSON Pointer must start with '/' or be empty, got: ${pointer}`);
  }

  const segments = pointer
    .slice(1)
    .split('/')
    .map((seg) => seg.replace(/~1/g, '/').replace(/~0/g, '~'));

  let current: unknown = data;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      if (!/^\d+$/.test(segment)) return undefined;
      const idx = Number(segment);
      if (idx < 0 || idx >= current.length) return undefined;
      current = current[idx];
      continue;
    }

    if (typeof current === 'object') {
      const obj = current as Record<string, unknown>;
      if (!(segment in obj)) return undefined;
      current = obj[segment];
      continue;
    }

    return undefined;
  }

  return current;
}
