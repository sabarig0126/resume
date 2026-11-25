import Prism from './prismCore';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-matlab';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-yaml';

const LANGUAGE_ALIASES: Record<string, string> = {
  py: 'python',
  python3: 'python',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  'c++': 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  mysql: 'sql',
  postgres: 'sql',
  postgresql: 'sql',
  sqlite: 'sql',
  plsql: 'sql',
  tsql: 'sql',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  yml: 'yaml',
  jsonc: 'json',
  m: 'matlab',
  octave: 'matlab',
};

export function resolvePrismLanguage(rawLang?: string): string | null {
  if (!rawLang) return null;
  const normalized = rawLang.trim().toLowerCase();
  if (!normalized || normalized === 'text' || normalized === 'plaintext' || normalized === 'plain' || normalized === 'txt') {
    return null;
  }
  const mapped = LANGUAGE_ALIASES[normalized] ?? normalized;
  return Prism.languages[mapped] ? mapped : null;
}

export function tokenizeCode(code: string, rawLang?: string): Array<string | Prism.Token> | null {
  const lang = resolvePrismLanguage(rawLang);
  if (!lang) return null;
  const grammar = Prism.languages[lang];
  if (!grammar) return null;
  return Prism.tokenize(code, grammar);
}

export type PrismTokenNode = string | Prism.Token;
