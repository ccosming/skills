import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Document, isMap, isPair, isScalar, Scalar, visit } from 'yaml';

import type { JsonSchema } from './validate.ts';

export interface WriteYamlOptions {
  schemaUrl?: string;
  schema?: JsonSchema;
}

const LINE_WIDTH = 100;

function orderBySchema(value: unknown, schema: JsonSchema | undefined): unknown {
  if (!schema || value === null || typeof value !== 'object') return value;

  if (schema.type === 'object' && schema.properties) {
    const obj = value as Record<string, unknown>;
    const ordered: Record<string, unknown> = {};
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        ordered[key] = orderBySchema(obj[key], propSchema);
      }
    }
    for (const [key, val] of Object.entries(obj)) {
      if (!(key in ordered)) {
        ordered[key] = val;
      }
    }
    return ordered;
  }

  if (schema.type === 'array' && schema.items && Array.isArray(value)) {
    const itemSchema = schema.items;
    return value.map((item) => orderBySchema(item, itemSchema));
  }

  return value;
}

function applyScalarStyles(doc: Document): void {
  visit(doc, {
    Scalar(key, node) {
      if (typeof node.value !== 'string') return;
      if (key === 'key') return;
      if (node.value.includes('\n')) {
        node.type = Scalar.BLOCK_LITERAL;
      } else if (node.value.length > LINE_WIDTH) {
        node.type = Scalar.BLOCK_FOLDED;
      } else {
        node.type = Scalar.QUOTE_DOUBLE;
      }
    },
  });
}

function attachComments(node: unknown, schema: JsonSchema | undefined): void {
  if (!schema || schema.type !== 'object' || !schema.properties) return;
  if (!isMap(node)) return;

  for (const item of node.items) {
    if (!isPair(item)) continue;
    const keyNode = item.key;
    if (!isScalar(keyNode) || typeof keyNode.value !== 'string') continue;
    const propSchema = schema.properties[keyNode.value];
    if (!propSchema) continue;
    if (propSchema.description) {
      keyNode.commentBefore = ` ${propSchema.description}`;
    }
    if (propSchema.type === 'object') {
      attachComments(item.value, propSchema);
    }
  }
}

export async function writeYaml(
  targetPath: string,
  data: unknown,
  options: WriteYamlOptions = {},
): Promise<void> {
  const ordered = options.schema ? orderBySchema(data, options.schema) : data;
  const doc = new Document(ordered);
  applyScalarStyles(doc);
  if (options.schema) attachComments(doc.contents, options.schema);
  const body = doc.toString({ lineWidth: LINE_WIDTH, indent: 2 });
  const header = options.schemaUrl ? `# yaml-language-server: $schema=${options.schemaUrl}\n` : '';
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, header + body, 'utf-8');
}
