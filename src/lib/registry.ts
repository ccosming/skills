import { basename, resolve } from 'node:path';

// Update <owner>/<repo>/<branch> when the GitHub remote is created or moved.
export const SCHEMA_BASE_URL =
  'https://raw.githubusercontent.com/ccosming/skills/main/plugins/code/schemas';

interface ArtifactDef {
  schemaPath: string;
  targetPath: string;
}

export const ARTIFACTS = {
  config: {
    schemaPath: 'schemas/config.schema.json',
    targetPath: '.project/config.yaml',
  },
  spec: {
    schemaPath: 'schemas/spec.schema.json',
    targetPath: '.project/spec.yaml',
  },
} as const satisfies Record<string, ArtifactDef>;

export type ArtifactName = keyof typeof ARTIFACTS;

export function isArtifactName(name: string): name is ArtifactName {
  return name in ARTIFACTS;
}

export interface ResolvedArtifact {
  schemaPath: string;
  targetPath: string;
}

export function resolveArtifact(
  name: ArtifactName,
  pluginRoot: string,
  projectRoot: string,
): ResolvedArtifact {
  const def = ARTIFACTS[name];
  return {
    schemaPath: resolve(pluginRoot, def.schemaPath),
    targetPath: resolve(projectRoot, def.targetPath),
  };
}

export function schemaUrl(name: ArtifactName): string {
  const def = ARTIFACTS[name];
  return `${SCHEMA_BASE_URL}/${basename(def.schemaPath)}`;
}
