import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { ARTIFACTS, isArtifactName, resolveArtifact, schemaUrl } from './lib/registry.ts';
import { validatePayload, type JsonSchema } from './lib/validate.ts';
import { writeYaml, type WriteYamlOptions } from './lib/yaml-write.ts';

const EXIT_USAGE = 1;
const EXIT_ALREADY = 2;
const EXIT_INVALID = 3;

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

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      payload: { type: 'string' },
    },
    allowPositionals: true,
  });

  const verb = positionals[0];
  const name = positionals[1];

  if (verb !== 'write' || !name) {
    fail(EXIT_USAGE, 'Usage: artifact-writer write <name> --payload <json>');
  }

  if (!isArtifactName(name)) {
    fail(EXIT_USAGE, `Unknown artifact: ${name}. Known: ${Object.keys(ARTIFACTS).join(', ')}`);
  }

  if (!values.payload) {
    fail(EXIT_USAGE, 'Missing --payload <json>');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(values.payload);
  } catch (err) {
    fail(EXIT_INVALID, `Invalid JSON in --payload: ${(err as Error).message}`);
  }

  const root = pluginRoot();
  const cwd = process.cwd();
  const { schemaPath, targetPath } = resolveArtifact(name, root, cwd);

  if (existsSync(targetPath)) {
    fail(EXIT_ALREADY, `already_configured: ${targetPath}`);
  }

  const schemaRaw = await readFile(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaRaw) as JsonSchema;
  const validated = validatePayload(schema, parsed);

  const writeOptions: WriteYamlOptions = { schema, schemaUrl: schemaUrl(name) };
  await writeYaml(targetPath, validated, writeOptions);
  console.log(`written: ${targetPath}`);
}

await main();
