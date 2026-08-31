/**
 * Language and extension detection utilities for NIP-C0 code snippets.
 */

const EXTENSION_TO_LANGUAGE_MAP: Record<string, string> = {
  // Web & JavaScript / TypeScript
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  vue: 'vue',
  svelte: 'svelte',

  // Python
  py: 'python',
  pyw: 'python',
  pyx: 'python',
  ipynb: 'python',

  // Systems & Compiled
  rs: 'rust',
  go: 'go',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  cs: 'csharp',
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  m: 'objective-c',
  mm: 'objective-c',
  zig: 'zig',
  nim: 'nim',

  // Scripting & Backend
  rb: 'ruby',
  php: 'php',
  phtml: 'php',
  pl: 'perl',
  pm: 'perl',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  fish: 'shell',
  ps1: 'powershell',
  lua: 'lua',
  r: 'r',
  jl: 'julia',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hrl: 'erlang',
  hs: 'haskell',
  lhs: 'haskell',
  clj: 'clojure',
  cljs: 'clojure',
  scala: 'scala',
  dart: 'dart',

  // Data, Config & Docs
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  sql: 'sql',
  md: 'markdown',
  markdown: 'markdown',
  rst: 'restructuredtext',
  tex: 'latex',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  makefile: 'makefile',
  graphql: 'graphql',
  gql: 'graphql',
  proto: 'protobuf',
  env: 'shell',
  ini: 'ini',
  conf: 'ini',
  txt: 'text',
};

const LANGUAGE_TO_EXTENSION_MAP: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  rust: 'rs',
  go: 'go',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  java: 'java',
  kotlin: 'kt',
  swift: 'swift',
  ruby: 'rb',
  php: 'php',
  perl: 'pl',
  shell: 'sh',
  bash: 'sh',
  powershell: 'ps1',
  lua: 'lua',
  r: 'r',
  julia: 'jl',
  elixir: 'ex',
  erlang: 'erl',
  haskell: 'hs',
  clojure: 'clj',
  scala: 'scala',
  dart: 'dart',
  zig: 'zig',
  nim: 'nim',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  vue: 'vue',
  svelte: 'svelte',
  json: 'json',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  sql: 'sql',
  markdown: 'md',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  graphql: 'graphql',
  protobuf: 'proto',
};

/**
 * Extracts extension from filename (without leading dot).
 */
export function extractExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  const cleanName = filename.trim().toLowerCase();
  if (cleanName === 'dockerfile' || cleanName.startsWith('dockerfile.')) return 'dockerfile';
  if (cleanName === 'makefile' || cleanName.startsWith('makefile.')) return 'makefile';
  if (cleanName === '.env' || cleanName.startsWith('.env.')) return 'env';

  const lastDotIndex = cleanName.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === cleanName.length - 1) {
    return '';
  }
  return cleanName.slice(lastDotIndex + 1);
}

/**
 * Detects lowercase language name from filename or explicit language string.
 */
export function detectLanguage(filename: string, explicitLanguage?: string): { language: string; extension: string } {
  const ext = extractExtension(filename);

  if (explicitLanguage && explicitLanguage.trim()) {
    const cleanExplicit = explicitLanguage.trim().toLowerCase();
    const mappedExt = ext || LANGUAGE_TO_EXTENSION_MAP[cleanExplicit] || '';
    return { language: cleanExplicit, extension: mappedExt };
  }

  if (ext && EXTENSION_TO_LANGUAGE_MAP[ext]) {
    return { language: EXTENSION_TO_LANGUAGE_MAP[ext], extension: ext };
  }

  return { language: ext || 'text', extension: ext || 'txt' };
}
