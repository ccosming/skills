import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  ARTIFACTS,
  isArtifactName,
  resolveArtifact,
  SCHEMA_BASE_URL,
  schemaUrl,
} from '../src/lib/registry.ts';
import { compileSchema, validatePayload } from '../src/lib/validate.ts';
import { writeYaml } from '../src/lib/yaml-write.ts';

describe('compileSchema', () => {
  it('compiles a string with enum', () => {
    const z = compileSchema({ type: 'string', enum: ['a', 'b'] });
    expect(z.parse('a')).toBe('a');
    expect(() => z.parse('c')).toThrow();
  });

  it('compiles a plain string', () => {
    const z = compileSchema({ type: 'string' });
    expect(z.parse('hello')).toBe('hello');
  });

  it('compiles an object with required and optional fields', () => {
    const z = compileSchema({
      type: 'object',
      required: ['a'],
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    expect(z.parse({ a: 'x' })).toEqual({ a: 'x' });
    expect(z.parse({ a: 'x', b: 'y' })).toEqual({ a: 'x', b: 'y' });
    expect(() => z.parse({})).toThrow();
  });

  it('rejects unknown keys when additionalProperties is false', () => {
    const z = compileSchema({
      type: 'object',
      additionalProperties: false,
      required: ['a'],
      properties: { a: { type: 'string' } },
    });
    expect(() => z.parse({ a: 'x', extra: 'y' })).toThrow();
  });

  it('throws on unsupported types', () => {
    expect(() => compileSchema({ type: 'unknown' as unknown as 'string' })).toThrow();
  });

  it('rejects non-string enums', () => {
    expect(() => compileSchema({ enum: [1, 2] })).toThrow();
  });
});

describe('validatePayload', () => {
  const configSchema = {
    type: 'object' as const,
    additionalProperties: false,
    required: ['interaction_language', 'artifact_language'],
    properties: {
      interaction_language: { type: 'string' as const, enum: ['en', 'es'] },
      artifact_language: { type: 'string' as const, enum: ['en', 'es'] },
    },
  };

  it('accepts a valid config payload', () => {
    expect(
      validatePayload(configSchema, { interaction_language: 'es', artifact_language: 'en' }),
    ).toEqual({ interaction_language: 'es', artifact_language: 'en' });
  });

  it('rejects unsupported language codes', () => {
    expect(() =>
      validatePayload(configSchema, { interaction_language: 'fr', artifact_language: 'en' }),
    ).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => validatePayload(configSchema, { interaction_language: 'en' })).toThrow();
  });
});

describe('registry', () => {
  it('recognizes known artifacts', () => {
    expect(isArtifactName('config')).toBe(true);
  });

  it('rejects unknown artifacts', () => {
    expect(isArtifactName('nonexistent')).toBe(false);
  });

  it('resolves absolute schema and target paths', () => {
    const { schemaPath, targetPath } = resolveArtifact('config', '/plugin', '/project');
    expect(schemaPath).toBe('/plugin/schemas/config.schema.json');
    expect(targetPath).toBe('/project/.project/config.yaml');
  });

  it('exposes the registered config artifact', () => {
    expect(ARTIFACTS.config.targetPath).toBe('.project/config.yaml');
    expect(ARTIFACTS.config.schemaPath).toBe('schemas/config.schema.json');
  });

  it('composes the schema URL from base + filename', () => {
    expect(schemaUrl('config')).toBe(`${SCHEMA_BASE_URL}/config.schema.json`);
  });
});

describe('writeYaml', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'aw-'));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('writes YAML with a schema header when provided', async () => {
    const target = join(tmp, 'nested', 'out.yaml');
    await writeYaml(target, { a: 1, b: 'hi' }, { schemaUrl: 'https://example.com/schema.json' });
    expect(existsSync(target)).toBe(true);
    const content = readFileSync(target, 'utf-8');
    expect(
      content.startsWith('# yaml-language-server: $schema=https://example.com/schema.json'),
    ).toBe(true);
    expect(content).toContain('a: 1');
    expect(content).toContain('b: "hi"');
  });

  it('omits the header when schemaUrl is absent', async () => {
    const target = join(tmp, 'plain.yaml');
    await writeYaml(target, { a: 1 });
    const content = readFileSync(target, 'utf-8');
    expect(content).not.toContain('yaml-language-server');
    expect(content).toContain('a: 1');
  });

  it('creates parent directories as needed', async () => {
    const target = join(tmp, 'a', 'b', 'c', 'file.yaml');
    await writeYaml(target, { ok: true });
    expect(existsSync(target)).toBe(true);
  });

  it('double-quotes string values within the line width', async () => {
    const target = join(tmp, 'short.yaml');
    await writeYaml(target, { lang: 'en', name: 'project' });
    const content = readFileSync(target, 'utf-8');
    expect(content).toContain('lang: "en"');
    expect(content).toContain('name: "project"');
  });

  it('keeps map keys plain (unquoted)', async () => {
    const target = join(tmp, 'keys.yaml');
    await writeYaml(target, { interaction_language: 'es' });
    const content = readFileSync(target, 'utf-8');
    expect(content).toContain('interaction_language: "es"');
    expect(content).not.toContain('"interaction_language"');
  });

  it('emits non-string scalars without quotes', async () => {
    const target = join(tmp, 'scalars.yaml');
    await writeYaml(target, { count: 42, active: true, missing: null });
    const content = readFileSync(target, 'utf-8');
    expect(content).toContain('count: 42');
    expect(content).toContain('active: true');
    expect(content).toMatch(/missing:\s*(null|~|$)/m);
  });

  it('uses folded block scalar (>) for strings longer than 100 chars', async () => {
    const target = join(tmp, 'long.yaml');
    const long = 'lorem ipsum '.repeat(20).trim();
    expect(long.length).toBeGreaterThan(100);
    await writeYaml(target, { description: long });
    const content = readFileSync(target, 'utf-8');
    expect(content).toMatch(/^description: >/m);
    expect(content).not.toContain(`"${long}"`);
    const lines = content.split('\n');
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(100);
    }
  });

  it('uses literal block scalar (|) for strings containing newlines', async () => {
    const target = join(tmp, 'literal.yaml');
    const value = 'line one\nline two\nline three';
    await writeYaml(target, { description: value });
    const content = readFileSync(target, 'utf-8');
    expect(content).toMatch(/^description: \|/m);
    expect(content).toContain('line one');
    expect(content).toContain('line two');
    expect(content).toContain('line three');
    expect(content).not.toContain('\\n');
    expect(content).not.toContain('description: >');
    expect(content).not.toMatch(/^description: "/m);
  });

  it('prefers literal over folded even when the string is long', async () => {
    const target = join(tmp, 'literal-long.yaml');
    const long = `${'a'.repeat(60)}\n${'b'.repeat(60)}`;
    await writeYaml(target, { text: long });
    const content = readFileSync(target, 'utf-8');
    expect(content).toMatch(/^text: \|/m);
    expect(content).not.toMatch(/^text: >/m);
  });

  it('orders top-level keys per schema properties order, not insertion order', async () => {
    const target = join(tmp, 'order.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        first: { type: 'string' as const },
        second: { type: 'string' as const },
        third: { type: 'string' as const },
      },
    };
    const data = { third: 'c', first: 'a', second: 'b' };
    await writeYaml(target, data, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content.indexOf('first:')).toBeLessThan(content.indexOf('second:'));
    expect(content.indexOf('second:')).toBeLessThan(content.indexOf('third:'));
  });

  it('orders nested object keys recursively per schema', async () => {
    const target = join(tmp, 'nested-order.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        meta: {
          type: 'object' as const,
          properties: {
            alpha: { type: 'string' as const },
            beta: { type: 'string' as const },
          },
        },
      },
    };
    const data = { meta: { beta: 'b', alpha: 'a' } };
    await writeYaml(target, data, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content.indexOf('alpha:')).toBeLessThan(content.indexOf('beta:'));
  });

  it('emits extra keys after schema-defined keys when additionalProperties is allowed', async () => {
    const target = join(tmp, 'extra.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        defined: { type: 'string' as const },
      },
    };
    const data = { extra: 'x', defined: 'd' };
    await writeYaml(target, data, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content.indexOf('defined:')).toBeLessThan(content.indexOf('extra:'));
  });

  it('attaches schema descriptions as comments before each field', async () => {
    const target = join(tmp, 'comments.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        lang: { type: 'string' as const, description: 'The language code.' },
        mode: { type: 'string' as const, description: 'Operating mode.' },
      },
    };
    await writeYaml(target, { lang: 'es', mode: 'fast' }, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content).toMatch(/# The language code\.\nlang: "es"/);
    expect(content).toMatch(/# Operating mode\.\nmode: "fast"/);
  });

  it('attaches comments to nested object fields too', async () => {
    const target = join(tmp, 'nested-comments.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        info: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const, description: 'Project name.' },
          },
        },
      },
    };
    await writeYaml(target, { info: { name: 'demo' } }, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content).toContain('# Project name.');
  });

  it('does not attach descriptions inside array items', async () => {
    const target = join(tmp, 'no-array-comments.yaml');
    const schema = {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const, description: 'Item name.' },
            },
          },
        },
      },
    };
    await writeYaml(target, { items: [{ name: 'a' }, { name: 'b' }] }, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content).not.toContain('# Item name.');
  });

  it('emits no comments when schema has no descriptions and no schemaUrl', async () => {
    const target = join(tmp, 'no-desc.yaml');
    const schema = {
      type: 'object' as const,
      properties: { x: { type: 'string' as const } },
    };
    await writeYaml(target, { x: 'y' }, { schema });
    const content = readFileSync(target, 'utf-8');
    expect(content).not.toContain('#');
  });
});
