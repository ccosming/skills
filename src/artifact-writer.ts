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
const EXIT_IO = 4;

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

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      payload: { type: 'string' },
      'payload-file': { type: 'string' },
    },
    allowPositionals: true,
  });

  const verb = positionals[0];
  const name = positionals[1];

  if (verb !== 'write' || !name) {
    fail(
      EXIT_USAGE,
      'Usage: artifact-writer write <name> (--payload <json> | --payload-file <path>)',
    );
  }

  if (!isArtifactName(name)) {
    fail(EXIT_USAGE, `Unknown artifact: ${name}. Known: ${Object.keys(ARTIFACTS).join(', ')}`);
  }

  const payloadText = await readPayload(values);

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadText);
  } catch (err) {
    fail(EXIT_INVALID, `Invalid JSON in payload: ${(err as Error).message}`);
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
