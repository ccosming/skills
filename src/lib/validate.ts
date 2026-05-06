import { z } from 'zod';

export interface JsonSchema {
  type?: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  enum?: readonly (string | number | boolean)[];
  items?: JsonSchema;
  description?: string;
  $schema?: string;
  $id?: string;
  title?: string;
}

export function compileSchema(schema: JsonSchema): z.ZodType {
  if (schema.enum) {
    if (!schema.enum.every((v) => typeof v === 'string')) {
      throw new Error('Only string enums are supported.');
    }
    const values = schema.enum as readonly string[];
    if (values.length === 0) throw new Error('Enum must have at least one value.');
    return z.enum(values as [string, ...string[]]);
  }
  if (schema.type === 'string') return z.string();
  if (schema.type === 'number' || schema.type === 'integer') return z.number();
  if (schema.type === 'boolean') return z.boolean();
  if (schema.type === 'array') {
    if (!schema.items) throw new Error('Array schema requires "items".');
    return z.array(compileSchema(schema.items));
  }
  if (schema.type === 'object') {
    const required = new Set(schema.required ?? []);
    const shape: Record<string, z.ZodType> = {};
    for (const [key, prop] of Object.entries(schema.properties ?? {})) {
      const compiled = compileSchema(prop);
      shape[key] = required.has(key) ? compiled : compiled.optional();
    }
    const obj = z.object(shape);
    return schema.additionalProperties === false ? obj.strict() : obj;
  }
  throw new Error(`Unsupported JSON Schema fragment: ${JSON.stringify(schema).slice(0, 120)}`);
}

export function validatePayload<T = unknown>(schema: JsonSchema, payload: unknown): T {
  return compileSchema(schema).parse(payload) as T;
}
