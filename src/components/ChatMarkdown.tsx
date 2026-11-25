import { Fragment, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { tokenizeCode, type PrismTokenNode } from '../lib/prismSetup';

interface ChatMarkdownProps {
  content: string;
}

type Alignment = 'left' | 'center' | 'right';

const ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&nbsp;': ' ',
};

export function decodeSpecialEntities(text: string): string {
  return text.replace(
    /&(?:amp|lt|gt|quot|apos|rsquo|lsquo|rdquo|ldquo|ndash|mdash|nbsp|#34|#39|#x27);/gi,
    (match) => ENTITY_MAP[match.toLowerCase()] ?? match
  );
}

function unescapeMarkdownChars(text: string): string {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!|>~&'"])/g, '$1');
}

function normalizeInput(raw: string): string {
  return decodeSpecialEntities(raw.replace(/\r\n?/g, '\n'));
}

function sanitizeHref(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function splitTableRow(line: string): string[] {
  let working = line.trim();
  if (working.startsWith('|')) {
    working = working.slice(1);
  }
  if (working.endsWith('|') && !working.endsWith('\\|')) {
    working = working.slice(0, -1);
  }

  const cells: string[] = [];
  let current = '';
  for (let i = 0; i < working.length; i++) {
    const ch = working[i];
    if (ch === '\\' && i + 1 < working.length && working[i + 1] === '|') {
      current += '|';
      i++;
      continue;
    }
    if (ch === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function parseTableAlignments(delimiterLine: string): Alignment[] | null {
  const trimmed = delimiterLine.trim();
  if (!trimmed.includes('|') && !/^:?-{2,}:?$/.test(trimmed)) {
    return null;
  }
  const cells = splitTableRow(trimmed);
  if (cells.length === 0) return null;

  const alignments: Alignment[] = [];
  for (const cell of cells) {
    if (!/^:?-{2,}:?$/.test(cell)) {
      return null;
    }
    const leftColon = cell.startsWith(':');
    const rightColon = cell.endsWith(':');
    if (leftColon && rightColon) {
      alignments.push('center');
    } else if (rightColon) {
      alignments.push('right');
    } else {
      alignments.push('left');
    }
  }
  return alignments;
}

function isTableStart(lines: string[], index: number): boolean {
  if (index + 1 >= lines.length) return false;
  const headerLine = lines[index].trim();
  const delimLine = lines[index + 1].trim();
  if (!headerLine.includes('|')) return false;
  const alignments = parseTableAlignments(delimLine);
  if (!alignments) return false;
  const headerCells = splitTableRow(headerLine);
  return headerCells.length >= 2 || headerLine.startsWith('|');
}

function renderPlainTextWithLinks(text: string, keyPrefix: string): ReactNode[] {
  const unescaped = unescapeMarkdownChars(text);
  const tokenRegex =
    /(https?:\/\/[^\s<>()]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchIdx = 0;

  while ((match = tokenRegex.exec(unescaped)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-p-${matchIdx}`}>
          {unescaped.slice(lastIndex, match.index)}
        </Fragment>
      );
    }

    let token = match[0];
    let trailing = '';
    while (token.length > 1 && /[.,;:!?)]$/.test(token)) {
      trailing = token.slice(-1) + trailing;
      token = token.slice(0, -1);
    }

    const isUrl = /^https?:\/\//i.test(token);
    const href = isUrl ? sanitizeHref(token) : sanitizeHref(`mailto:${token}`);

    if (href) {
      nodes.push(
        <a
          key={`${keyPrefix}-a-${matchIdx}`}
          href={href}
          target={isUrl ? '_blank' : undefined}
          rel={isUrl ? 'noopener noreferrer' : undefined}
          className="underline decoration-teal-300/70 underline-offset-2 text-teal-200 hover:text-emerald-300 break-all"
        >
          {token}
        </a>
      );
    } else {
      nodes.push(
        <Fragment key={`${keyPrefix}-raw-${matchIdx}`}>{token}</Fragment>
      );
    }

    if (trailing) {
      nodes.push(
        <Fragment key={`${keyPrefix}-tr-${matchIdx}`}>{trailing}</Fragment>
      );
    }

    lastIndex = tokenRegex.lastIndex;
    matchIdx++;
  }

  if (lastIndex < unescaped.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-end`}>
        {unescaped.slice(lastIndex)}
      </Fragment>
    );
  }

  return nodes;
}

export function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const inlinePattern =
    /(`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\)|\*\*\*[^*\n]+?\*\*\*|___[^_\n]+?___|\*\*[^*\n]+?\*\*|__[^_\n]+?__|(?<!\\)\*[^*\n]+?(?<!\\)\*|\b_[^_\n]+?_\b)/g;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...renderPlainTextWithLinks(
          text.slice(lastIndex, match.index),
          `${keyPrefix}-txt-${tokenIdx}`
        )
      );
    }

    const token = match[0];
    const tokenKey = `${keyPrefix}-tok-${tokenIdx}`;

    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      nodes.push(
        <code
          key={tokenKey}
          className="rounded bg-black/40 border border-teal-300/20 px-1.5 py-0.5 font-['ui-monospace',SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-[11.5px] text-emerald-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]\n]+)\]\(([^)\n]+)\)$/.exec(token);
      if (linkMatch) {
        const label = linkMatch[1];
        const safeUrl = sanitizeHref(linkMatch[2]);
        if (safeUrl) {
          const isExternal = /^https?:\/\//i.test(safeUrl);
          nodes.push(
            <a
              key={tokenKey}
              href={safeUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="underline decoration-teal-300/70 underline-offset-2 text-teal-200 hover:text-emerald-300 break-words"
            >
              {renderInlineMarkdown(label, `${tokenKey}-lbl`)}
            </a>
          );
        } else {
          nodes.push(
            ...renderPlainTextWithLinks(label, `${tokenKey}-badurl`)
          );
        }
      } else {
        nodes.push(...renderPlainTextWithLinks(token, `${tokenKey}-linkfb`));
      }
    } else if (
      (token.startsWith('***') && token.endsWith('***') && token.length > 6) ||
      (token.startsWith('___') && token.endsWith('___') && token.length > 6)
    ) {
      nodes.push(
        <strong key={tokenKey} className="font-bold text-white">
          <em className="italic">
            {renderInlineMarkdown(token.slice(3, -3), `${tokenKey}-bi`)}
          </em>
        </strong>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**') && token.length > 4) ||
      (token.startsWith('__') && token.endsWith('__') && token.length > 4)
    ) {
      nodes.push(
        <strong key={tokenKey} className="font-bold text-white">
          {renderInlineMarkdown(token.slice(2, -2), `${tokenKey}-b`)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*') && token.length > 2) ||
      (token.startsWith('_') && token.endsWith('_') && token.length > 2)
    ) {
      nodes.push(
        <em key={tokenKey} className="italic text-teal-100">
          {renderInlineMarkdown(token.slice(1, -1), `${tokenKey}-i`)}
        </em>
      );
    } else {
      nodes.push(...renderPlainTextWithLinks(token, `${tokenKey}-fb`));
    }

    lastIndex = inlinePattern.lastIndex;
    tokenIdx++;
  }

  if (lastIndex < text.length) {
    nodes.push(
      ...renderPlainTextWithLinks(
        text.slice(lastIndex),
        `${keyPrefix}-tail`
      )
    );
  }

  return nodes;
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*$/;
const BULLET_RE = /^(\s*)(?:[-*+•▪])\s+(.*)$/;
const ORDERED_RE = /^(\s*)(\d+)[.)]\s+(.*)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const HR_RE = /^(?:-{3,}|\*{3,}|_{3,})$/;
const FENCE_RE = /^```([a-zA-Z0-9_+-]*)\s*$/;

const TOKEN_COLOR_MAP: Record<string, string> = {
  comment: 'text-teal-400/65 italic',
  prolog: 'text-teal-400/65 italic',
  doctype: 'text-teal-400/65 italic',
  cdata: 'text-teal-400/65 italic',
  punctuation: 'text-teal-200/75',
  keyword: 'text-fuchsia-300 font-medium',
  atrule: 'text-fuchsia-300 font-medium',
  important: 'text-fuchsia-300 font-semibold',
  rule: 'text-fuchsia-300 font-medium',
  builtin: 'text-cyan-300',
  'class-name': 'text-cyan-300',
  'type-definition': 'text-cyan-300',
  namespace: 'text-cyan-200',
  function: 'text-sky-300',
  method: 'text-sky-300',
  'function-variable': 'text-sky-300',
  string: 'text-emerald-300',
  char: 'text-emerald-300',
  'template-string': 'text-emerald-300',
  'string-interpolation': 'text-emerald-300',
  'attr-value': 'text-emerald-300',
  regex: 'text-emerald-200',
  number: 'text-amber-300',
  boolean: 'text-amber-300',
  constant: 'text-amber-300',
  symbol: 'text-amber-300',
  operator: 'text-teal-200',
  entity: 'text-teal-200',
  url: 'text-teal-200 underline',
  property: 'text-lime-200',
  'attr-name': 'text-lime-200',
  variable: 'text-lime-200',
  parameter: 'text-lime-200',
  interpolation: 'text-amber-200',
  decorator: 'text-pink-300',
  annotation: 'text-pink-300',
  tag: 'text-rose-300',
  deleted: 'text-rose-400',
  inserted: 'text-emerald-300',
  bold: 'font-bold text-white',
  italic: 'italic',
};

function getPrismTokenClass(type: string, alias?: string | string[]): string | undefined {
  if (TOKEN_COLOR_MAP[type]) {
    return TOKEN_COLOR_MAP[type];
  }
  if (typeof alias === 'string' && TOKEN_COLOR_MAP[alias]) {
    return TOKEN_COLOR_MAP[alias];
  }
  if (Array.isArray(alias)) {
    for (const a of alias) {
      if (TOKEN_COLOR_MAP[a]) {
        return TOKEN_COLOR_MAP[a];
      }
    }
  }
  return undefined;
}

function renderPrismTokenNode(node: PrismTokenNode, key: string): ReactNode {
  if (typeof node === 'string') {
    return <Fragment key={key}>{node}</Fragment>;
  }

  const className = getPrismTokenClass(node.type, node.alias);
  const content = node.content;
  let children: ReactNode;

  if (typeof content === 'string') {
    children = content;
  } else if (Array.isArray(content)) {
    children = content.map((child, idx) =>
      renderPrismTokenNode(child as PrismTokenNode, `${key}-${idx}`)
    );
  } else {
    children = renderPrismTokenNode(content as PrismTokenNode, `${key}-0`);
  }

  return (
    <span key={key} className={className}>
      {children}
    </span>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenizeCode(code, lang);
  const displayLang = lang.trim() || 'code';

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // Ignore clipboard permission errors in restricted contexts
    }
  };

  return (
    <div className="my-1.5 overflow-hidden rounded-lg border border-teal-300/20 bg-[#031212]/95">
      <div className="flex items-center justify-between gap-2 border-b border-teal-300/15 bg-[#020D0D]/90 px-2.5 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-300/80">
          {displayLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied code' : 'Copy code'}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-teal-200/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-2.5">
        <pre className="m-0 font-['ui-monospace',SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-[11.5px] leading-relaxed text-[#E6F4F1] whitespace-pre">
          <code>
            {tokens
              ? tokens.map((tok, idx) => renderPrismTokenNode(tok, `tok-${idx}`))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function isBlockStarter(lines: string[], idx: number): boolean {
  const line = lines[idx];
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (FENCE_RE.test(trimmed)) return true;
  if (HEADING_RE.test(trimmed)) return true;
  if (HR_RE.test(trimmed)) return true;
  if (BLOCKQUOTE_RE.test(trimmed)) return true;
  if (BULLET_RE.test(line)) return true;
  if (ORDERED_RE.test(line)) return true;
  if (isTableStart(lines, idx)) return true;
  return false;
}

function renderBlockquoteLines(quoteLines: string[], keyPrefix: string): ReactNode {
  const cleaned = quoteLines.map((l) => l.replace(/^>\s?/, ''));
  return (
    <blockquote
      key={keyPrefix}
      className="my-1 rounded-r-lg border-l-2 border-emerald-400/75 bg-[#061D1D]/75 px-3 py-1.5 text-teal-100/95 space-y-1"
    >
      {renderBlocks(cleaned, `${keyPrefix}-bq`)}
    </blockquote>
  );
}

function renderBlocks(lines: string[], keyPrefix: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced code block
    const fenceMatch = FENCE_RE.exec(trimmed);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push(
        <CodeBlock
          key={`${keyPrefix}-code-${blockIdx}`}
          code={codeLines.join('\n')}
          lang={lang}
        />
      );
      blockIdx++;
      continue;
    }

    // 2. Markdown table
    if (isTableStart(lines, i)) {
      const headers = splitTableRow(lines[i]);
      const alignments = parseTableAlignments(lines[i + 1]) ?? [];
      i += 2;

      const bodyRows: string[][] = [];
      while (i < lines.length) {
        const rowTrimmed = lines[i].trim();
        if (!rowTrimmed || !rowTrimmed.includes('|')) break;
        if (
          HEADING_RE.test(rowTrimmed) ||
          BLOCKQUOTE_RE.test(rowTrimmed) ||
          FENCE_RE.test(rowTrimmed)
        ) {
          break;
        }
        bodyRows.push(splitTableRow(lines[i]));
        i++;
      }

      const colCount = Math.max(headers.length, alignments.length);

      const alignClass = (colIdx: number) => {
        const align = alignments[colIdx] ?? 'left';
        if (align === 'center') return 'text-center';
        if (align === 'right') return 'text-right';
        return 'text-left';
      };

      blocks.push(
        <div
          key={`${keyPrefix}-tbl-${blockIdx}`}
          className="my-1.5 w-full overflow-x-auto rounded-lg border border-teal-300/25 bg-[#041818]/85"
        >
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-teal-300/25 bg-[#0C3333]/85">
                {Array.from({ length: colCount }, (_, colIdx) => (
                  <th
                    key={`th-${colIdx}`}
                    className={`px-2.5 py-1.5 font-bold text-emerald-200 align-top ${alignClass(colIdx)}`}
                  >
                    {renderInlineMarkdown(
                      headers[colIdx] ?? '',
                      `${keyPrefix}-th-${blockIdx}-${colIdx}`
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-300/15">
              {bodyRows.map((row, rowIdx) => (
                <tr
                  key={`tr-${rowIdx}`}
                  className={rowIdx % 2 === 1 ? 'bg-white/[0.02]' : undefined}
                >
                  {Array.from({ length: colCount }, (_, colIdx) => (
                    <td
                      key={`td-${colIdx}`}
                      className={`px-2.5 py-1.5 text-[#E8F6F6] align-top ${alignClass(colIdx)}`}
                    >
                      {renderInlineMarkdown(
                        row[colIdx] ?? '',
                        `${keyPrefix}-td-${blockIdx}-${rowIdx}-${colIdx}`
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      blockIdx++;
      continue;
    }

    // 3. Headings
    const headingMatch = HEADING_RE.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const styleClass =
        level <= 2
          ? 'text-[14px] font-bold text-white border-b border-teal-300/15 pb-0.5'
          : level === 3
            ? 'text-[13.5px] font-bold text-teal-100'
            : 'text-[13px] font-semibold text-emerald-200';
      blocks.push(
        <div
          key={`${keyPrefix}-h-${blockIdx}`}
          role="heading"
          aria-level={level}
          className={`pt-0.5 leading-snug ${styleClass}`}
        >
          {renderInlineMarkdown(headingText, `${keyPrefix}-h-${blockIdx}`)}
        </div>
      );
      i++;
      blockIdx++;
      continue;
    }

    // 4. Horizontal Rule
    if (HR_RE.test(trimmed)) {
      blocks.push(
        <hr
          key={`${keyPrefix}-hr-${blockIdx}`}
          className="my-1.5 border-teal-300/20"
        />
      );
      i++;
      blockIdx++;
      continue;
    }

    // 5. Blockquote
    if (BLOCKQUOTE_RE.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim());
        i++;
      }
      blocks.push(
        renderBlockquoteLines(quoteLines, `${keyPrefix}-q-${blockIdx}`)
      );
      blockIdx++;
      continue;
    }

    // 6. Bullet List
    if (BULLET_RE.test(rawLine)) {
      const items: Array<{ indent: number; text: string }> = [];
      while (i < lines.length) {
        const m = BULLET_RE.exec(lines[i]);
        if (!m) break;
        items.push({ indent: m[1].length, text: m[2] });
        i++;
      }
      const baseIndent = items[0]?.indent ?? 0;
      blocks.push(
        <ul
          key={`${keyPrefix}-ul-${blockIdx}`}
          className="list-disc space-y-1 pl-4 text-[#E8F6F6]"
        >
          {items.map((item, itemIdx) => (
            <li
              key={`li-${itemIdx}`}
              className={
                item.indent > baseIndent + 1
                  ? 'ml-3 list-[circle] leading-relaxed'
                  : 'leading-relaxed'
              }
            >
              {renderInlineMarkdown(
                item.text,
                `${keyPrefix}-ul-${blockIdx}-${itemIdx}`
              )}
            </li>
          ))}
        </ul>
      );
      blockIdx++;
      continue;
    }

    // 7. Numbered List
    if (ORDERED_RE.test(rawLine)) {
      const items: Array<{ num: number; indent: number; text: string }> = [];
      while (i < lines.length) {
        const m = ORDERED_RE.exec(lines[i]);
        if (!m) break;
        items.push({
          indent: m[1].length,
          num: Number.parseInt(m[2], 10),
          text: m[3],
        });
        i++;
      }
      const startNum = items[0]?.num ?? 1;
      blocks.push(
        <ol
          key={`${keyPrefix}-ol-${blockIdx}`}
          start={startNum !== 1 ? startNum : undefined}
          className="list-decimal space-y-1 pl-4 text-[#E8F6F6]"
        >
          {items.map((item, itemIdx) => (
            <li key={`oli-${itemIdx}`} className="leading-relaxed">
              {renderInlineMarkdown(
                item.text,
                `${keyPrefix}-ol-${blockIdx}-${itemIdx}`
              )}
            </li>
          ))}
        </ol>
      );
      blockIdx++;
      continue;
    }

    // 8. Paragraph (collect consecutive plain lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      if (isBlockStarter(lines, i)) break;
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push(
        <p key={`${keyPrefix}-p-${blockIdx}`} className="leading-relaxed">
          {paraLines.map((pLine, pIdx) => (
            <Fragment key={`pl-${pIdx}`}>
              {pIdx > 0 && <br />}
              {renderInlineMarkdown(pLine, `${keyPrefix}-p-${blockIdx}-${pIdx}`)}
            </Fragment>
          ))}
        </p>
      );
      blockIdx++;
    } else {
      // Safety advance if an unexpected line wasn't matched
      blocks.push(
        <p key={`${keyPrefix}-fb-${blockIdx}`} className="leading-relaxed">
          {renderInlineMarkdown(rawLine, `${keyPrefix}-fb-${blockIdx}`)}
        </p>
      );
      i++;
      blockIdx++;
    }
  }

  return blocks;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const normalized = normalizeInput(content);
  const lines = normalized.split('\n');

  return (
    <div className="space-y-2 break-words text-[13px] text-[#E8F6F6]">
      {renderBlocks(lines, 'md')}
    </div>
  );
}
