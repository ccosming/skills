import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

interface Target {
  entry: string;
  out: string;
}

const TARGETS: Target[] = [
  { entry: 'src/artifact-writer.ts', out: 'plugins/code/bin/artifact-writer.js' },
];

const SHEBANG = '#!/usr/bin/env -S bun run\n';
const ROOT = resolve(import.meta.dirname, '..');

let failed = false;

for (const { entry, out } of TARGETS) {
  const entryAbs = resolve(ROOT, entry);
  const outAbs = resolve(ROOT, out);

  const result = await Bun.build({
    entrypoints: [entryAbs],
    target: 'bun',
    minify: false,
  });

  if (!result.success) {
    failed = true;
    console.error(`✗ ${out}`);
    for (const log of result.logs) console.error(log);
    continue;
  }

  const code = await result.outputs[0]!.text();
  await mkdir(dirname(outAbs), { recursive: true });
  await writeFile(outAbs, SHEBANG + code, 'utf-8');
  await chmod(outAbs, 0o755);

  const sizeKb = Math.round((SHEBANG.length + code.length) / 1024);
  console.log(`✓ ${out} (${sizeKb} KB)`);
}

if (failed) process.exit(1);
