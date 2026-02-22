/**
 * ui-web4 Core Module
 *
 * Handles streaming spec updates with mixed text/spec content.
 * Spec format: ```spec fence blocks containing JSON Patch operations.
 */

import { z } from 'zod';

// ─── Schema Helpers ───────────────────────────────────────────────────────────

/**
 * Re-export Zod as 'schema' for catalog definitions
 */
export const schema = z;

/**
 * Type-safe catalog definition helper.
 * Used to define component catalogs with Zod validation.
 */
export function defineCatalog<T extends CatalogDefinition>(
  _schema: typeof z,
  catalog: T
): T {
  return catalog;
}

export interface CatalogDefinition {
  components: Record<string, ComponentDefinition>;
  actions?: Record<string, ActionDefinition>;
}

export interface ComponentDefinition {
  props: z.ZodType<any>;
  description?: string;
  example?: any;
}

export interface ActionDefinition {
  params: z.ZodType<any>;
  description?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Spec {
  root: string;
  elements: Record<string, SpecElement>;
}

export interface SpecElement {
  type: string;
  props: Record<string, any>;
  children: string[];
}

export interface SpecStreamLine {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

interface MixedStreamParserCallbacks {
  onText: (text: string) => void;
  onPatch: (patch: SpecStreamLine) => void;
}

// ─── Mixed Stream Parser ──────────────────────────────────────────────────────

/**
 * Creates a parser that handles mixed text and spec fence blocks.
 *
 * Usage:
 * const parser = createMixedStreamParser({
 *   onText: (text) => console.log('Text:', text),
 *   onPatch: (patch) => console.log('Patch:', patch)
 * });
 *
 * parser.push('Some text\n```spec\n{"op":"add","path":"/root","value":"id1"}\n```\nMore text\n');
 */
export function createMixedStreamParser(callbacks: MixedStreamParserCallbacks) {
  let buffer = '';
  let inSpecFence = false;
  let fenceBuffer = '';

  return {
    push(chunk: string) {
      buffer += chunk;
      const lines = buffer.split('\n');

      // Keep last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        // Check for spec fence markers
        if (line.trim() === '```spec') {
          inSpecFence = true;
          fenceBuffer = '';
          continue;
        }

        if (line.trim() === '```' && inSpecFence) {
          inSpecFence = false;
          fenceBuffer = '';
          continue;
        }

        if (inSpecFence) {
          // Inside spec fence - parse as JSON Patch
          const trimmed = line.trim();
          if (trimmed) {
            try {
              const patch = JSON.parse(trimmed) as SpecStreamLine;
              callbacks.onPatch(patch);
            } catch (err) {
              console.error('[MixedStreamParser] Failed to parse spec line:', trimmed, err);
            }
          }
        } else {
          // Outside fence - plain text
          if (line) {
            callbacks.onText(line);
          }
        }
      }
    },

    flush() {
      // Flush any remaining buffer content
      if (buffer.trim() && !inSpecFence) {
        callbacks.onText(buffer);
      }
      buffer = '';
    }
  };
}

// ─── Spec Patch Application ──────────────────────────────────────────────────

/**
 * Applies a JSON Patch operation to a Spec object.
 *
 * Supports standard JSON Patch operations:
 * - add: Add a value at path
 * - remove: Remove value at path
 * - replace: Replace value at path
 * - move: Move value from one path to another
 * - copy: Copy value from one path to another
 * - test: Test that path has expected value
 *
 * Usage:
 * const spec = { root: '', elements: {} };
 * const updated = applySpecPatch(spec, { op: 'add', path: '/root', value: 'id1' });
 */
export function applySpecPatch(spec: Spec, patch: SpecStreamLine): Spec {
  const newSpec = JSON.parse(JSON.stringify(spec)) as Spec; // Deep clone

  const { op, path, value, from } = patch;
  const pathParts = path.split('/').filter(Boolean);

  switch (op) {
    case 'add': {
      if (pathParts.length === 0) {
        return newSpec;
      }

      if (pathParts.length === 1) {
        // Top-level property (e.g., /root)
        (newSpec as any)[pathParts[0]] = value;
      } else {
        // Nested property (e.g., /elements/id1)
        let target: any = newSpec;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const key = pathParts[i];
          if (!(key in target)) {
            target[key] = {};
          }
          target = target[key];
        }
        target[pathParts[pathParts.length - 1]] = value;
      }
      break;
    }

    case 'remove': {
      if (pathParts.length === 0) {
        return newSpec;
      }

      if (pathParts.length === 1) {
        delete (newSpec as any)[pathParts[0]];
      } else {
        let target: any = newSpec;
        for (let i = 0; i < pathParts.length - 1; i++) {
          target = target[pathParts[i]];
          if (!target) return newSpec;
        }
        delete target[pathParts[pathParts.length - 1]];
      }
      break;
    }

    case 'replace': {
      if (pathParts.length === 0) {
        return newSpec;
      }

      if (pathParts.length === 1) {
        (newSpec as any)[pathParts[0]] = value;
      } else {
        let target: any = newSpec;
        for (let i = 0; i < pathParts.length - 1; i++) {
          target = target[pathParts[i]];
          if (!target) return newSpec;
        }
        target[pathParts[pathParts.length - 1]] = value;
      }
      break;
    }

    case 'move': {
      if (!from) return newSpec;

      // Get value from source path
      const fromParts = from.split('/').filter(Boolean);
      let sourceValue: any;
      if (fromParts.length === 1) {
        sourceValue = (newSpec as any)[fromParts[0]];
        delete (newSpec as any)[fromParts[0]];
      } else {
        let target: any = newSpec;
        for (let i = 0; i < fromParts.length - 1; i++) {
          target = target[fromParts[i]];
          if (!target) return newSpec;
        }
        sourceValue = target[fromParts[fromParts.length - 1]];
        delete target[fromParts[fromParts.length - 1]];
      }

      // Apply to destination path
      return applySpecPatch(newSpec, { op: 'add', path, value: sourceValue });
    }

    case 'copy': {
      if (!from) return newSpec;

      // Get value from source path
      const fromParts = from.split('/').filter(Boolean);
      let sourceValue: any;
      if (fromParts.length === 1) {
        sourceValue = (newSpec as any)[fromParts[0]];
      } else {
        let target: any = newSpec;
        for (let i = 0; i < fromParts.length - 1; i++) {
          target = target[fromParts[i]];
          if (!target) return newSpec;
        }
        sourceValue = target[fromParts[fromParts.length - 1]];
      }

      // Apply to destination path
      return applySpecPatch(newSpec, { op: 'add', path, value: sourceValue });
    }

    case 'test': {
      // Test operation - verify path has expected value
      // (typically used for validation, not mutation)
      if (pathParts.length === 1) {
        const actual = (newSpec as any)[pathParts[0]];
        if (JSON.stringify(actual) !== JSON.stringify(value)) {
          console.warn('[SpecPatch] Test failed at', path, '- expected:', value, 'actual:', actual);
        }
      } else {
        let target: any = newSpec;
        for (let i = 0; i < pathParts.length - 1; i++) {
          target = target[pathParts[i]];
          if (!target) {
            console.warn('[SpecPatch] Test failed - path not found:', path);
            return newSpec;
          }
        }
        const actual = target[pathParts[pathParts.length - 1]];
        if (JSON.stringify(actual) !== JSON.stringify(value)) {
          console.warn('[SpecPatch] Test failed at', path, '- expected:', value, 'actual:', actual);
        }
      }
      break;
    }

    default:
      console.warn('[SpecPatch] Unknown operation:', op);
  }

  return newSpec;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Creates an empty spec
 */
export function createEmptySpec(): Spec {
  return {
    root: '',
    elements: {}
  };
}

/**
 * Validates a spec structure
 */
export function isValidSpec(spec: any): spec is Spec {
  return (
    spec &&
    typeof spec === 'object' &&
    'root' in spec &&
    'elements' in spec &&
    typeof spec.elements === 'object'
  );
}
