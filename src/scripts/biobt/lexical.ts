/**
 * Minimal builders for Payload's Lexical rich-text shape.
 *
 * Written by hand rather than pulled in as a dependency: the import only needs
 * paragraphs, headings and bullet lists, and hand-rolling them keeps the
 * product copy readable as plain data in one file.
 */
/** Payload requires every node to carry `type` and `version`, so they are not optional here. */
type Node = { type: string; version: number; [key: string]: unknown }

const text = (value: string): Node => ({
  type: 'text',
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

export const paragraph = (value: string): Node => ({
  type: 'paragraph',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const heading = (value: string, tag: 'h2' | 'h3' = 'h2'): Node => ({
  type: 'heading',
  tag,
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

export const bullets = (values: string[]): Node => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: values.map((value, index) => ({
    type: 'listitem',
    value: index + 1,
    checked: undefined,
    children: [text(value)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  })),
})

export const richText = (nodes: Node[]) => ({
  root: {
    type: 'root',
    children: nodes,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
