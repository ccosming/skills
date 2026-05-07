import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
import { compileSchema, validatePayload, type JsonSchema } from '../src/lib/validate.ts';
import { writeYaml } from '../src/lib/yaml-write.ts';

const PLUGIN_ROOT = join(import.meta.dirname, '..', 'plugins', 'code');

function loadSchema(name: string): JsonSchema {
  const path = join(PLUGIN_ROOT, 'schemas', `${name}.schema.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as JsonSchema;
}

const CLI = join(PLUGIN_ROOT, 'bin', 'artifact-writer.js');

interface CliResult {
  status: number;
  stdout: string;
  stderr: string;
}

function runCli(args: string[], cwd: string): CliResult {
  try {
    const stdout = execFileSync('bun', [CLI, ...args], {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      status: e.status ?? -1,
      stdout: e.stdout?.toString('utf-8') ?? '',
      stderr: e.stderr?.toString('utf-8') ?? '',
    };
  }
}

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

  it('enforces minLength on strings', () => {
    const z = compileSchema({ type: 'string', minLength: 1 });
    expect(z.parse('a')).toBe('a');
    expect(() => z.parse('')).toThrow();
  });

  it('enforces minItems on arrays', () => {
    const z = compileSchema({
      type: 'array',
      minItems: 1,
      items: { type: 'string' },
    });
    expect(z.parse(['x'])).toEqual(['x']);
    expect(() => z.parse([])).toThrow();
  });

  it('enforces maxItems on arrays', () => {
    const z = compileSchema({
      type: 'array',
      maxItems: 2,
      items: { type: 'string' },
    });
    expect(z.parse(['x', 'y'])).toEqual(['x', 'y']);
    expect(() => z.parse(['x', 'y', 'z'])).toThrow();
  });

  it('enforces ISO date format on strings', () => {
    const z = compileSchema({ type: 'string', format: 'date' });
    expect(z.parse('2026-05-06')).toBe('2026-05-06');
    expect(() => z.parse('2026-5-6')).toThrow();
    expect(() => z.parse('not a date')).toThrow();
  });

  it('enforces regex pattern on strings', () => {
    const z = compileSchema({ type: 'string', pattern: '^[a-z]+$' });
    expect(z.parse('hello')).toBe('hello');
    expect(() => z.parse('Hello')).toThrow();
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

describe('spec.schema.json', () => {
  const schema = loadSchema('spec');

  const minimalSpec = {
    identity: {
      name: 'demo',
      type: 'plugin',
      description: 'A demo project.',
      out_of_scope: ['Auto-deploy'],
    },
    goals: { outcomes: ['Ship something useful.'] },
    architecture: { style: 'modular-monolith' },
    stack: { languages: ['typescript@6'] },
    practices: {
      testing_strategy: {
        unit: 'All pure functions.',
        integration: 'CLI smoke test.',
        e2e: 'Deferred.',
      },
      branching_model: 'trunk',
    },
    metadata: { spec_version: '0.1.0', last_updated: '2026-05-06' },
  };

  it('accepts a minimal valid spec', () => {
    expect(() => validatePayload(schema, minimalSpec)).not.toThrow();
  });

  it('rejects missing required top-level sections', () => {
    const partial = { ...minimalSpec, metadata: undefined };
    delete (partial as Record<string, unknown>).metadata;
    expect(() => validatePayload(schema, partial)).toThrow();
  });

  it('rejects empty out_of_scope (minItems: 1)', () => {
    const bad = {
      ...minimalSpec,
      identity: { ...minimalSpec.identity, out_of_scope: [] },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects unknown architecture style', () => {
    const bad = { ...minimalSpec, architecture: { style: 'spaghetti' } };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects malformed last_updated', () => {
    const bad = {
      ...minimalSpec,
      metadata: { spec_version: '0.1.0', last_updated: '5/6/2026' },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects unknown cross_cutting key', () => {
    const bad = {
      ...minimalSpec,
      architecture: {
        style: 'monolith',
        cross_cutting: { magic: 'wand' },
      },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects quality_attribute with invalid priority', () => {
    const bad = {
      ...minimalSpec,
      goals: {
        ...minimalSpec.goals,
        quality_attributes: [{ name: 'security', priority: 'urgent' }],
      },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects boundary with invalid kind', () => {
    const bad = {
      ...minimalSpec,
      architecture: {
        style: 'monolith',
        boundaries: [{ name: 'api', kind: 'sideways', description: 'hmm' }],
      },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects empty stack.languages', () => {
    const bad = { ...minimalSpec, stack: { languages: [] } };
    expect(() => validatePayload(schema, bad)).toThrow();
  });

  it('rejects unknown branching_model', () => {
    const bad = {
      ...minimalSpec,
      practices: { ...minimalSpec.practices, branching_model: 'mainline' },
    };
    expect(() => validatePayload(schema, bad)).toThrow();
  });
});

describe('artifact-writer CLI', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'cli-'));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('writes config from --payload', () => {
    const r = runCli(
      ['write', 'config', '--payload', '{"interaction_language":"es","artifact_language":"en"}'],
      tmp,
    );
    expect(r.status).toBe(0);
    const content = readFileSync(join(tmp, '.project/config.yaml'), 'utf-8');
    expect(content).toContain('interaction_language: "es"');
  });

  it('writes spec from --payload-file', () => {
    const payload = {
      identity: {
        name: 'demo',
        type: 'plugin',
        description: 'A demo project.',
        out_of_scope: ['Auto-deploy'],
      },
      goals: { outcomes: ['Ship something useful.'] },
      architecture: { style: 'modular-monolith' },
      stack: { languages: ['typescript@6'] },
      practices: {
        testing_strategy: {
          unit: 'All pure functions.',
          integration: 'CLI smoke test.',
          e2e: 'Deferred.',
        },
        branching_model: 'trunk',
      },
      metadata: { spec_version: '0.1.0', last_updated: '2026-05-06' },
    };
    const payloadPath = join(tmp, 'payload.json');
    writeFileSync(payloadPath, JSON.stringify(payload));
    const r = runCli(['write', 'spec', '--payload-file', payloadPath], tmp);
    expect(r.status).toBe(0);
    const content = readFileSync(join(tmp, '.project/spec.yaml'), 'utf-8');
    expect(content).toContain('name: "demo"');
    expect(content).toContain('style: "modular-monolith"');
  });

  it('rejects passing both --payload and --payload-file', () => {
    const payloadPath = join(tmp, 'p.json');
    writeFileSync(payloadPath, '{}');
    const r = runCli(['write', 'config', '--payload', '{}', '--payload-file', payloadPath], tmp);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('not both');
  });

  it('exits with code 4 when --payload-file path does not exist', () => {
    const r = runCli(['write', 'config', '--payload-file', '/no/such/file.json'], tmp);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain('Cannot read');
  });

  it('exits with code 2 when target already exists', () => {
    const first = runCli(
      ['write', 'config', '--payload', '{"interaction_language":"es","artifact_language":"en"}'],
      tmp,
    );
    expect(first.status).toBe(0);
    const second = runCli(
      ['write', 'config', '--payload', '{"interaction_language":"es","artifact_language":"en"}'],
      tmp,
    );
    expect(second.status).toBe(2);
    expect(second.stderr).toContain('already_configured');
  });

  it('exits with code 3 when payload JSON is malformed', () => {
    const r = runCli(['write', 'config', '--payload', '{not json'], tmp);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain('Invalid JSON');
  });

  it('exits with code 1 for unknown artifact', () => {
    const r = runCli(['write', 'unknown', '--payload', '{}'], tmp);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Unknown artifact');
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

  it('exposes the registered spec artifact', () => {
    expect(ARTIFACTS.spec.targetPath).toBe('.project/spec.yaml');
    expect(ARTIFACTS.spec.schemaPath).toBe('schemas/spec.schema.json');
  });

  it('recognizes spec as a known artifact', () => {
    expect(isArtifactName('spec')).toBe(true);
  });

  it('composes the schema URL from base + filename', () => {
    expect(schemaUrl('config')).toBe(`${SCHEMA_BASE_URL}/config.schema.json`);
    expect(schemaUrl('spec')).toBe(`${SCHEMA_BASE_URL}/spec.schema.json`);
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
