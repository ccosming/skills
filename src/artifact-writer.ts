import { existsSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';

import { resolvePointer } from './lib/json-pointer.ts';
import { ARTIFACTS, isArtifactName, resolveArtifact, schemaUrl } from './lib/registry.ts';
import { validatePayload, type JsonSchema } from './lib/validate.ts';
import { writeYaml, type WriteYamlOptions } from './lib/yaml-write.ts';

const EXIT_USAGE = 1;
const EXIT_ALREADY = 2;
const EXIT_INVALID_JSON = 3;
const EXIT_IO = 4;
const EXIT_NOT_CONFIGURED = 5;
const EXIT_PATH_NOT_FOUND = 6;
const EXIT_VALIDATION = 7;

type Verb = 'write' | 'update' | 'read';

const VERBS: readonly Verb[] = ['write', 'update', 'read'] as const;

function isVerb(value: string): value is Verb {
  return (VERBS as readonly string[]).includes(value);
}

function pluginRoot(): string {
  const fromEnv = process.env['CLAUDE_PLUGIN_ROOT'];
  if (fromEnv) return fromEnv;
  const here = fileURLToPath(import.meta.url);
  if (here.includes('/plugins/code/bin/')) {
    return resolve(dirname(here), '..');
  }
  return resolve(dirname(here), '..', 'plugins', 'code');
}

function fail(code: number, message: string): never {
  console.error(message);
  process.exit(code);
}

async function readPayload(values: { payload?: string; 'payload-file'?: string }): Promise<string> {
  if (values.payload && values['payload-file']) {
    fail(EXIT_USAGE, 'Pass either --payload or --payload-file, not both.');
  }
  if (values.payload) return values.payload;
  if (values['payload-file']) {
    try {
      return await readFile(values['payload-file'], 'utf-8');
    } catch (err) {
      fail(EXIT_IO, `Cannot read --payload-file: ${(err as Error).message}`);
    }
  }
  fail(EXIT_USAGE, 'Missing --payload <json> or --payload-file <path>');
}

async function loadSchema(schemaPath: string): Promise<JsonSchema> {
  const schemaRaw = await readFile(schemaPath, 'utf-8');
  return JSON.parse(schemaRaw) as JsonSchema;
}

function validateOrFail(schema: JsonSchema, parsed: unknown): unknown {
  try {
    return validatePayload(schema, parsed);
  } catch (err) {
    fail(EXIT_VALIDATION, `validation_failed: ${(err as Error).message}`);
  }
}

async function handleWrite(
  schema: JsonSchema,
  parsed: unknown,
  targetPath: string,
  artifactName: 'config' | 'spec',
): Promise<void> {
  const validated = validateOrFail(schema, parsed);
  const writeOptions: WriteYamlOptions = { schema, schemaUrl: schemaUrl(artifactName) };
  await writeYaml(targetPath, validated, writeOptions);
  console.log(`written: ${targetPath}`);
}

async function handleUpdate(
  schema: JsonSchema,
  parsed: unknown,
  targetPath: string,
  artifactName: 'config' | 'spec',
): Promise<void> {
  const validated = validateOrFail(schema, parsed);
  const writeOptions: WriteYamlOptions = { schema, schemaUrl: schemaUrl(artifactName) };
  await writeYaml(targetPath, validated, writeOptions);
  console.log(`updated: ${targetPath}`);
}

async function handleRead(
  schema: JsonSchema,
  targetPath: string,
  pathSelector: string | undefined,
): Promise<void> {
  let yamlText: string;
  try {
    yamlText = await readFile(targetPath, 'utf-8');
  } catch (err) {
    fail(EXIT_IO, `Cannot read artifact: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(yamlText);
  } catch (err) {
    fail(EXIT_VALIDATION, `validation_failed: malformed YAML — ${(err as Error).message}`);
  }

  const validated = validateOrFail(schema, parsed);

  if (pathSelector === undefined) {
    console.log(JSON.stringify(validated));
    return;
  }

  const slice = resolvePointer(validated, pathSelector);
  if (slice === undefined) {
    fail(EXIT_PATH_NOT_FOUND, `path_not_found: ${pathSelector}`);
  }
  console.log(JSON.stringify(slice));
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      payload: { type: 'string' },
      'payload-file': { type: 'string' },
      path: { type: 'string' },
      'cleanup-payload-file': { type: 'boolean' },
    },
    allowPositionals: true,
  });

  const verb = positionals[0];
  const name = positionals[1];

  if (!verb || !isVerb(verb) || !name) {
    fail(
      EXIT_USAGE,
      'Usage:\n' +
        '  artifact-writer write <name> (--payload <json> | --payload-file <path>)\n' +
        '  artifact-writer update <name> (--payload <json> | --payload-file <path>)\n' +
        '  artifact-writer read <name> [--path <json-pointer>]',
    );
  }

  if (!isArtifactName(name)) {
    fail(EXIT_USAGE, `Unknown artifact: ${name}. Known: ${Object.keys(ARTIFACTS).join(', ')}`);
  }

  const root = pluginRoot();
  const cwd = process.cwd();
  const { schemaPath, targetPath } = resolveArtifact(name, root, cwd);
  const exists = existsSync(targetPath);

  if (verb === 'read' && values['cleanup-payload-file']) {
    fail(EXIT_USAGE, '--cleanup-payload-file is only valid with write or update.');
  }

  if (verb === 'write') {
    if (exists) fail(EXIT_ALREADY, `already_configured: ${targetPath}`);
    if (values.path !== undefined) fail(EXIT_USAGE, '--path is only valid with the read verb.');
    const payloadText = await readPayload(values);
    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadText);
    } catch (err) {
      fail(EXIT_INVALID_JSON, `Invalid JSON in payload: ${(err as Error).message}`);
    }
    const schema = await loadSchema(schemaPath);
    await handleWrite(schema, parsed, targetPath, name);
    await maybeCleanup(values);
    return;
  }

  if (verb === 'update') {
    if (!exists) fail(EXIT_NOT_CONFIGURED, `not_configured: ${targetPath}`);
    if (values.path !== undefined) fail(EXIT_USAGE, '--path is only valid with the read verb.');
    const payloadText = await readPayload(values);
    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadText);
    } catch (err) {
      fail(EXIT_INVALID_JSON, `Invalid JSON in payload: ${(err as Error).message}`);
    }
    const schema = await loadSchema(schemaPath);
    await handleUpdate(schema, parsed, targetPath, name);
    await maybeCleanup(values);
    return;
  }

  // verb === 'read'
  if (!exists) fail(EXIT_NOT_CONFIGURED, `not_configured: ${targetPath}`);
  if (values.payload !== undefined || values['payload-file'] !== undefined) {
    fail(EXIT_USAGE, '--payload / --payload-file are not valid with the read verb.');
  }
  const schema = await loadSchema(schemaPath);
  await handleRead(schema, targetPath, values.path);
}

async function maybeCleanup(values: {
  'payload-file'?: string;
  'cleanup-payload-file'?: boolean;
}): Promise<void> {
  if (!values['cleanup-payload-file']) return;
  const path = values['payload-file'];
  if (!path) return;
  try {
    await unlink(path);
  } catch {
    // best-effort: a missing file is fine, anything else is non-fatal too
  }
}

await main();
