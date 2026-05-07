import { z } from 'zod';

export interface JsonSchema {
  type?: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  enum?: readonly (string | number | boolean)[];
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'date';
  description?: string;
  $schema?: string;
  $id?: string;
  title?: string;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function compileSchema(schema: JsonSchema): z.ZodType {
  if (schema.enum) {
    if (!schema.enum.every((v) => typeof v === 'string')) {
      throw new Error('Only string enums are supported.');
    }
    const values = schema.enum as readonly string[];
    if (values.length === 0) throw new Error('Enum must have at least one value.');
    return z.enum(values as [string, ...string[]]);
  }
  if (schema.type === 'string') {
    let s = z.string();
    if (typeof schema.minLength === 'number') s = s.min(schema.minLength);
    if (typeof schema.maxLength === 'number') s = s.max(schema.maxLength);
    if (schema.pattern) s = s.regex(new RegExp(schema.pattern));
    if (schema.format === 'date') s = s.regex(ISO_DATE_RE, 'Expected ISO date YYYY-MM-DD');
    return s;
  }
  if (schema.type === 'number' || schema.type === 'integer') return z.number();
  if (schema.type === 'boolean') return z.boolean();
  if (schema.type === 'array') {
    if (!schema.items) throw new Error('Array schema requires "items".');
    let arr = z.array(compileSchema(schema.items));
    if (typeof schema.minItems === 'number') arr = arr.min(schema.minItems);
    if (typeof schema.maxItems === 'number') arr = arr.max(schema.maxItems);
    return arr;
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
