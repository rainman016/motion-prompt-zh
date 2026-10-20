#!/usr/bin/env node
/* Motion Prompt skill CLI · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
// Node 18+, no dependencies. Reads the static Motion Prompt API (api/v1) and prints what an agent needs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from './config.mjs';

const VERSION = '0.2.0-zh.1';
const SELF = fileURLToPath(import.meta.url);
const ENV = process.env;
const SOURCE_ROOT = path.resolve(path.dirname(SELF), '..', '..', '..');
const CONFIG_FILE = fs.existsSync(path.join(SOURCE_ROOT, 'site.config.json')) && fs.existsSync(path.join(SOURCE_ROOT, 'packs'))
  ? path.join(SOURCE_ROOT, 'site.config.json') : new URL('./site-config.json', import.meta.url);
const CONFIG = resolveConfig(JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')));
const SITE = CONFIG.site;
const REMOTES = [...new Set([CONFIG.apiBase, CONFIG.rawApiBase])];
const normalizeLang = value => value === 'zh' || value === 'zh-Hans' ? 'zh-Hans' : ['en', 'ja'].includes(value) ? value : null;
const langArg = process.argv.findIndex(v => v === '--lang' || v.startsWith('--lang='));
let UI_LANG = normalizeLang(langArg >= 0 ? process.argv[langArg].split('=')[1] || process.argv[langArg + 1] : null) || 'zh-Hans';
const msg = (en, zh) => UI_LANG === 'zh-Hans' ? zh : en;
const MAX_GET = 8;
const EXIT = { OK: 0, NOT_FOUND: 1, USAGE: 2, NETWORK: 3, TIMEOUT: 4 };
const PICK_TIMEOUT = 900; // seconds
const PICK_MAX = 60;
const NOTE_MAX = 1000;

class CliError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ---------- arguments ----------

const VALUE_FLAGS = new Set(['lang', 'pack', 'limit', 'out', 'timeout']);
const BOOL_FLAGS = new Set(['refresh', 'help', 'version', 'no-open', 'local']);

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    if (BOOL_FLAGS.has(name)) { flags[name] = true; continue; }
    if (!VALUE_FLAGS.has(name)) throw new CliError(EXIT.USAGE, msg(`Unknown option --${name}. Run with --help.`, `未知参数 --${name}，请运行 --help 查看用法。`));
    const value = eq === -1 ? argv[++i] : a.slice(eq + 1);
    if (value === undefined || value === '') throw new CliError(EXIT.USAGE, msg(`Option --${name} needs a value.`, `参数 --${name} 需要一个值。`));
    flags[name] = value;
  }
  return { flags, command: rest[0], args: rest.slice(1) };
}

const HELP_ZH = `motion-prompt-zh ${VERSION} — Motion Prompt 中文动效库 Skill
配置站点（不代表已上线）：${SITE}

用法：node motion-prompt.mjs <命令> [参数]
  info                 查看数据来源、版本、元素数量和缓存
  list                 列出分类；--pack ui 列出该包所有动画
  search <关键词...>   搜索中文、英文、日文，支持 --pack 和 --limit
  get <编号...>        获取中文规格与原始代码，每次最多 ${MAX_GET} 项
  prompt <编号...>     获取可直接使用的中文 Prompt
  kit <分类包>         获取原始共享代码，不翻译代码标识符
  pick                 打开效果库并等待选择；完整源码仓库默认使用本地页

参数：--lang zh-Hans|zh|en|ja（默认中文） --out <目录> --refresh
pick：--local（要求完整源码） --no-open（只打印链接） --pack <分类包>
      --timeout <秒>（默认 ${PICK_TIMEOUT}）
环境变量：MOTION_PROMPT_BASE（本地 api/v1 或 URL，多个来源用逗号分隔）
          MOTION_PROMPT_CACHE（缓存目录） MOTION_PROMPT_TTL（目录缓存秒数，默认 21600）
中文资源缺失会报错，不静默替换为原版英文。回退来源或离线缓存会明确提示。
退出码：0 成功 · 1 未找到 · 2 参数错误 · 3 数据不可用 · 4 等待选择超时`;
const HELP = `motion-prompt-zh ${VERSION} — Motion Prompt catalog for coding agents
${SITE}

Usage: node motion-prompt.mjs <command> [options]

  pick                  open the gallery so the user can pick; prints what they picked   [--pack <pack>]
                        [--timeout <seconds, default ${PICK_TIMEOUT}>] [--no-open] [--local]
  search <words...>     best matches (Chinese, English or Japanese)   [--pack <pack>] [--limit N]
  list                  packs, categories and counts
  list --pack <pack>    every element in one pack
  get <id> [<id>...]    code + spec for up to ${MAX_GET} elements (accepts 12, 012, #012 or a demo URL)
  prompt <id> [...]     the copy-paste prompt for an element
  kit <pack>            shared constants and helpers the pack's elements need
  info                  data source, counts, version, cache folder

Options:
  --lang zh-Hans|en|ja  language of names and text (default zh-Hans; zh is an alias)
  --out <dir>           write files into <dir> instead of printing (get, prompt, kit)
  --refresh             ignore the disk cache
  --no-open             pick: print the gallery URL instead of opening a browser
  --local               pick: require a full local clone (a clone is preferred automatically)
Environment:
  MOTION_PROMPT_BASE    comma-separated data sources (folder path or URL) used instead of the defaults
  MOTION_PROMPT_CACHE   cache folder (default ~/.cache/motion-prompt-zh, then the temp folder)
  MOTION_PROMPT_TTL     seconds before the cached catalog is fetched again (default 21600)
Exit codes: 0 ok · 1 not found · 2 usage · 3 no data source reachable · 4 pick timed out`;

// ---------- data sources ----------

const isUrl = (s) => /^https?:\/\//i.test(s);

function localRepoBase() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..', 'api', 'v1');
  return fs.existsSync(path.join(dir, 'catalog.json')) ? dir : null;
}

function resolveSources() {
  const env = (ENV.MOTION_PROMPT_BASE || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (env.length) return { origin: 'MOTION_PROMPT_BASE', bases: env.map((s) => (isUrl(s) ? s.replace(/\/+$/, '') : path.resolve(s))) };
  const local = localRepoBase();
  if (local) return { origin: 'local clone', bases: [local] };
  return { origin: 'default', bases: REMOTES };
}

function cacheRoots() {
  const roots = [];
  if (ENV.MOTION_PROMPT_CACHE) roots.push(path.resolve(ENV.MOTION_PROMPT_CACHE));
  else {
    try { roots.push(path.join(os.homedir(), '.cache', 'motion-prompt-zh')); } catch { /* no home folder */ }
    roots.push(path.join(os.tmpdir(), 'motion-prompt-zh-cache'));
  }
  return roots;
}

class Store {
  constructor({ refresh }) {
    const { origin, bases } = resolveSources();
    this.origin = origin;
    this.bases = bases;
    this.refresh = !!refresh;
    this.remote = bases.some(isUrl);
    this.key = crypto.createHash('sha1').update(bases.join('|')).digest('hex').slice(0, 10);
    this.ttl = Math.max(0, Number(ENV.MOTION_PROMPT_TTL ?? 21600)) * 1000;
    this.cacheRoot = null;
    this.usedBase = null;
    this.fromCache = false;
    this.failures = [];
    this.catalog = null;
  }

  cacheDir() { return this.cacheRoot || path.join(cacheRoots()[0], this.key); }

  cacheRead(rel) {
    if (!this.remote) return null;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        const stat = fs.statSync(file);
        this.cacheRoot = path.join(root, this.key);
        let base = null;
        try { base = JSON.parse(fs.readFileSync(file + '.source.json', 'utf8')).base; } catch { /* legacy cache */ }
        return { text: fs.readFileSync(file, 'utf8'), age: Date.now() - stat.mtimeMs, base };
      } catch { /* try the next cache folder */ }
    }
    return null;
  }

  cacheWrite(rel, text, base) {
    if (!this.remote) return;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
        fs.writeFileSync(file + '.source.json', JSON.stringify({ base }));
        this.cacheRoot = path.join(root, this.key);
        return;
      } catch { /* read-only place: try the next one, or run without a cache */ }
    }
  }

  sourceNotice(rel, base, cached = false) {
    if (cached || base !== this.bases[0]) process.stderr.write(msg(
      `motion-prompt-zh: ${rel} from ${cached ? 'cache' : 'fallback source'}: ${base || 'original source unknown (legacy cache)'}.\n`,
      `motion-prompt-zh：${rel} 使用${cached ? '缓存' : '备用来源'}：${base || '旧缓存，原始来源未知'}。\n`));
  }

  // Returns { text } on success, { missing: true } when every source answered "no such file",
  // or { down: true } when no source could be reached at all.
  async readSources(rel) {
    let missing = 0;
    for (const base of this.bases) {
      try {
        if (isUrl(base)) {
          const res = await fetch(`${base}/${rel}`, {
            headers: { 'User-Agent': `motion-prompt-skill/${VERSION}` },
            signal: AbortSignal.timeout(12000),
          });
          if (res.status === 404) { missing++; this.failures.push(`${base}/${rel} → HTTP 404`); continue; }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.usedBase = this.usedBase || base;
          return { text: await res.text(), base };
        }
        const file = path.join(base, rel);
        if (!fs.existsSync(file)) { missing++; continue; }
        this.usedBase = this.usedBase || base;
        return { text: fs.readFileSync(file, 'utf8'), base };
      } catch (err) {
        const cause = err && err.cause && (err.cause.code || err.cause.message);
        this.failures.push(`${base}/${rel} → ${cause || err.name || 'error'}${err.message ? ` (${err.message})` : ''}`);
      }
    }
    return missing === this.bases.length ? { missing: true } : { down: true };
  }

  async loadCatalog() {
    if (this.catalog) return this.catalog;
    const cached = this.refresh ? null : this.cacheRead('catalog.json');
    let text = null;
    if (cached && cached.age < this.ttl) { text = cached.text; this.fromCache = true; this.usedBase = cached.base; this.sourceNotice('catalog.json', cached.base, true); }
    if (text === null) {
      const got = await this.readSources('catalog.json');
      if (got.text !== undefined) { text = got.text; this.usedBase = got.base; this.sourceNotice('catalog.json', got.base); this.cacheWrite('catalog.json', text, got.base); }
      else {
        const stale = cached || this.cacheRead('catalog.json');
        if (stale) {
          text = stale.text; this.fromCache = true; this.usedBase = stale.base;
          process.stderr.write(msg('motion-prompt-zh: source unreachable; using cached catalog.\n', 'motion-prompt-zh：数据源无法访问，正在使用离线目录缓存。\n'));
          this.sourceNotice('catalog.json', stale.base, true);
        } else throw this.unreachable('catalog.json', false); // no catalog anywhere = no usable source
      }
    }
    let data;
    try { data = JSON.parse(text); } catch { throw new CliError(EXIT.NETWORK, msg(`catalog.json from ${this.usedBase || 'cache'} is not valid JSON.`, `来源 ${this.usedBase || '缓存'} 的 catalog.json 不是有效 JSON。`)); }
    if (!data || !Array.isArray(data.elements)) throw new CliError(EXIT.NETWORK, msg('catalog.json has no "elements" list.', 'catalog.json 缺少 elements 列表。'));
    if (UI_LANG === 'zh-Hans') requireChinese(data, this.usedBase || 'cache');
    this.catalog = data;
    return data;
  }

  async file(rel) {
    const cat = await this.loadCatalog();
    const versioned = path.join('v', String(cat.version ?? '0').replace(/[^\w.-]/g, '_'), rel);
    if (!this.refresh) {
      const hit = this.cacheRead(versioned);
      if (hit) { this.sourceNotice(rel, hit.base, true); return this.checkedResource(rel, hit.text, cat); }
    }
    const got = await this.readSources(rel);
    if (got.text !== undefined) { const text = this.checkedResource(rel, got.text, cat); this.sourceNotice(rel, got.base); this.cacheWrite(versioned, text, got.base); return text; }
    const stale = this.cacheRead(versioned);
    if (stale) { this.sourceNotice(rel, stale.base, true); return this.checkedResource(rel, stale.text, cat); }
    throw this.unreachable(rel, got.missing);
  }

  checkedResource(rel, text, cat) {
    const match = /^zh-Hans\/(e|p)\/(\d{3})\.txt$/.exec(rel);
    if (!match) return text; // kit code is deliberately unchanged.
    const e = cat.elements.find(e => e.id === match[2]);
    const normalized = text.replace(/\r\n/g, '\n');
    if (!e || ![e.name['zh-Hans'], e.summary['zh-Hans'], e.use['zh-Hans'], ...e.spec['zh-Hans']].every(s => normalized.includes(s))) {
      throw new CliError(EXIT.NOT_FOUND, msg(`Chinese resource ${rel} does not match the Chinese catalog. No English fallback was used.`, `中文资源 ${rel} 缺失或与中文目录不一致，未使用英文替代。请核对数据来源并重新构建。`));
    }
    return text;
  }

  unreachable(rel, missing) {
    if (missing) return new CliError(EXIT.NOT_FOUND, msg(`Not found in the Motion Prompt data: ${rel}\nSources checked:\n${this.bases.map((b) => `  ${b}`).join('\n')}`, `缺少资源：${rel}\n未使用原版英文替代。已检查来源：\n${this.bases.map(b => `  ${b}`).join('\n')}\n若中文版尚未发布，请将 MOTION_PROMPT_BASE 设置为本地 api/v1。`));
    if (UI_LANG === 'zh-Hans') return new CliError(EXIT.NETWORK, `无法读取 Motion Prompt 中文数据：${rel}，且没有可用缓存。\n已尝试：\n${(this.failures.length ? this.failures : this.bases).map(s => '  ' + s).join('\n')}\n配置的中文版 API 可能尚未上线，或当前网络不可用。请设置 MOTION_PROMPT_BASE 为本地 api/v1，或检查上述来源。`);
    const lines = [
      `motion-prompt: could not reach the Motion Prompt data (${rel}) and nothing is cached.`,
      'Tried:',
      ...this.failures.map((f) => `  ${f}`),
      this.failures.length && this.failures.every((f) => f.endsWith('HTTP 404'))
        ? 'The sources answered, but none of them has this file. The data may not be published at these addresses yet.\nSet MOTION_PROMPT_BASE to a local copy of api/v1 if you have one.'
        : this.remote
        ? 'This command needs access to the configured data sources listed above.\nAllow network access or set MOTION_PROMPT_BASE to a local copy of api/v1.'
        : 'Check that MOTION_PROMPT_BASE points at a folder that contains catalog.json.',
    ];
    return new CliError(EXIT.NETWORK, lines.join('\n'));
  }
}

function requireChinese(cat, source) {
  const missing = [];
  const nonempty = s => typeof s === 'string' && s.trim();
  for (const p of cat.packs || []) {
    if (!nonempty(p.title?.['zh-Hans']) || !Array.isArray(p.categories) || !p.categories.length || !p.categories.every(c => nonempty(c?.['zh-Hans']))) missing.push(p.pack || 'pack');
  }
  for (const e of cat.elements) {
    if (!['name', 'meaning', 'ask', 'summary', 'use'].every(k => nonempty(e[k]?.['zh-Hans'])) ||
        !Array.isArray(e.spec?.['zh-Hans']) || !e.spec['zh-Hans'].length || !e.spec['zh-Hans'].every(nonempty)) missing.push('#' + e.id);
  }
  if (!cat.elements.length || !cat.packs?.length || missing.length) throw new CliError(EXIT.NOT_FOUND,
    `来源 ${source} 缺少完整简体中文内容${missing.length ? '：' + missing.slice(0, 8).join('、') : ''}。\n未静默回退到原版英文。请设置 MOTION_PROMPT_BASE 指向中文版 api/v1，或重新构建；如确需原文，请明确指定 --lang en 或 --lang ja。`);
}

// ---------- catalog helpers ----------

const HAS_JA = /[\u3040-\u30ff\uff66-\uff9f]/;
const tx = (v, lang) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : String(v[lang] ?? v.en ?? v.ja ?? ''));
const both = (v) => (v == null ? '' : typeof v === 'string' ? v : Object.values(v).map(both).join(' '));
const packKey = (p) => String(p.pack ?? p.id ?? p.slug ?? p.name ?? '');
const pad = (n) => String(n).padStart(3, '0');
const demoUrl = (id, lang = UI_LANG) => `${SITE}?lang=${lang}#${id}`;

function packsOf(cat) {
  const listed = Array.isArray(cat.packs) ? cat.packs.map((p) => (typeof p === 'string' ? { pack: p } : p)) : [];
  const seen = new Set(listed.map(packKey));
  for (const e of cat.elements) if (!seen.has(e.pack)) { seen.add(e.pack); listed.push({ pack: e.pack }); }
  return listed;
}

function categoryLabel(cat, e, lang) {
  const p = packsOf(cat).find((x) => packKey(x) === e.pack);
  const c = p && Array.isArray(p.categories) ? p.categories.find((x) => x.slug === e.category) : null;
  if (!c) return { label: e.category || '', haystack: e.category || '' };
  return { label: tx(c, lang) || c.slug, haystack: `${c.slug} ${both(c)}` };
}

function requirePack(cat, name) {
  const wanted = String(name).toLowerCase();
  const found = packsOf(cat).find((p) => packKey(p).toLowerCase() === wanted);
  if (!found) throw new CliError(EXIT.NOT_FOUND, msg(`No pack named "${name}". Packs: ${packsOf(cat).map(packKey).join(', ')}`, `没有分类包“${name}”。可用分类：${packsOf(cat).map(packKey).join('、')}`));
  return packKey(found);
}

function parseId(token) {
  const m = /(?:^|#|\/)(\d{1,4})\/?$/.exec(String(token).trim());
  return m ? pad(Number(m[1])) : null;
}

function resolveIds(cat, tokens, max) {
  if (!tokens.length) throw new CliError(EXIT.USAGE, msg('Give at least one element id, e.g. 12, #045 or a demo URL.', '请至少提供一个动画编号，例如 12、#045 或演示链接。'));
  const ids = [];
  const bad = [];
  for (const t of tokens) {
    const id = parseId(t);
    if (!id || !cat.elements.some((e) => e.id === id)) bad.push(t);
    else if (!ids.includes(id)) ids.push(id);
  }
  if (bad.length) {
    const all = cat.elements.map((e) => e.id);
    throw new CliError(EXIT.NOT_FOUND, msg(`No such element: ${bad.join(', ')}. The catalog has ${all.length} elements (#${all[0]}–#${all[all.length - 1]}). Use "search" or "list" to find ids; do not guess them.`, `找不到动画：${bad.join('、')}。目录共 ${all.length} 项（#${all[0]}–#${all[all.length - 1]}），请用 search 或 list 查询，不要猜测编号。`));
  }
  if (ids.length > max) throw new CliError(EXIT.USAGE, msg(`Too many ids (${ids.length}). Fetch at most ${max} per call, and only the ones you will use.`, `一次最多读取 ${max} 项，当前为 ${ids.length} 项；请只读取实际使用的动画。`));
  return ids;
}

function line(cat, e, lang) {
  return `#${e.id}  ${tx(e.name, lang)}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]  ${tx(e.summary, lang)}`;
}

// ---------- search ----------

function score(cat, e, tokens) {
  const name = both(e.name).toLowerCase();
  const names = Object.values(e.name).map((s) => s.toLowerCase());
  const aliases = both(e.aliases).toLowerCase();
  const tags = (e.tags || []).map((t) => String(t).toLowerCase());
  const slug = String(e.slug || '').toLowerCase();
  const catHay = `${categoryLabel(cat, e, 'en').haystack} ${e.pack} ${both((packsOf(cat).find((p) => packKey(p) === e.pack) || {}).title)}`.toLowerCase();
  const summary = `${both(e.summary)} ${both(e.meaning)}`.toLowerCase();
  const deep = `${both(e.use)} ${both(e.spec)}`.toLowerCase();
  let total = 0;
  let matched = 0;
  for (const raw of tokens) {
    const forms = [raw];
    if (/^[a-z]{4,}s$/.test(raw)) forms.push(raw.slice(0, -1));
    let best = 0;
    for (const t of forms) {
      let s = 0;
      if (parseId(t) === e.id && /^#?\d+$/.test(t)) s += 20;
      if (names.includes(t)) s += 12; else if (name.includes(t)) s += 8;
      if (slug === t || slug.split('-').includes(t)) s += 6; else if (slug.includes(t)) s += 3;
      if (tags.includes(t)) s += 6; else if (tags.some((g) => g.includes(t))) s += 3;
      if (aliases.includes(t)) s += 6;
      if (catHay.includes(t)) s += 3;
      if (summary.includes(t)) s += 2;
      if (deep.includes(t)) s += 1;
      best = Math.max(best, s);
    }
    if (best > 0) matched++;
    total += best;
  }
  return { matched, total };
}

// ---------- output ----------

function emit(files, outDir) {
  if (!outDir) { process.stdout.write(files.map((f) => f.text.replace(/\s*$/, '\n')).join('\n')); return; }
  const dir = path.resolve(outDir);
  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f.name), f.text);
  } catch (err) { throw new CliError(EXIT.USAGE, msg(`Cannot write to ${dir}: ${err.message}`, `无法写入 ${dir}：${err.message}`)); }
  for (const f of files) console.log(path.join(dir, f.name));
}

// ---------- commands ----------

async function cmdSearch(store, args, flags, lang) {
  if (!args.length) throw new CliError(EXIT.USAGE, msg('search needs at least one word, e.g. "search typewriter" or "search 文字 登場".', 'search 需要关键词，例如 search 弹性、search 文字 入场。'));
  const cat = await store.loadCatalog();
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;
  const limit = Math.max(1, Math.min(50, Number(flags.limit) || 8));
  const tokens = args.join(' ').toLowerCase().split(/[\s,、　]+/).filter(Boolean);
  const hits = cat.elements
    .filter((e) => !pack || e.pack === pack)
    .map((e) => ({ e, ...score(cat, e, tokens) }))
    .filter((h) => h.matched > 0)
    .sort((a, b) => b.matched - a.matched || b.total - a.total || a.e.id.localeCompare(b.e.id));
  if (!hits.length) {
    console.log(msg(`No match for "${args.join(' ')}"${pack ? ` in pack ${pack}` : ''}. Try other words (English tags match best), or browse with "list --pack <pack>".`, `没有找到“${args.join(' ')}”${pack ? `（分类 ${pack}）` : ''}。请换用中文或英文关键词，或用 list --pack <分类包> 浏览。`));
    return;
  }
  for (const h of hits.slice(0, limit)) console.log(line(cat, h.e, lang));
  if (hits.length > limit) console.log(msg(`… ${hits.length - limit} more. Narrow with --pack or raise --limit.`, `… 另有 ${hits.length - limit} 项，可用 --pack 缩小范围或提高 --limit。`));
  console.log(msg(`\nNext: get <id> for the code and spec. Demo: ${SITE}#<id>`, `\n下一步：get <编号> 读取规格与代码，kit <分类包> 读取共享实现。演示链接使用配置站点 ${SITE}。`));
}

async function cmdList(store, flags, lang) {
  const cat = await store.loadCatalog();
  if (flags.pack) {
    const pack = requirePack(cat, flags.pack);
    const items = cat.elements.filter((e) => e.pack === pack);
    let current = null;
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      if (label !== current) { console.log(`${current === null ? '' : '\n'}## ${label}`); current = label; }
      console.log(`#${e.id}  ${tx(e.name, lang)}  ${tx(e.summary, lang)}`);
    }
    return;
  }
  for (const p of packsOf(cat)) {
    const key = packKey(p);
    const items = cat.elements.filter((e) => e.pack === key);
    if (!items.length) continue;
    console.log(`${key}  (${items.length})  #${items[0].id}–#${items[items.length - 1].id}  ${tx(p.title, lang)}`);
    const counts = new Map();
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    for (const [label, n] of counts) console.log(`  - ${label} (${n})`);
  }
  console.log(msg(`\n${cat.elements.length} elements. Browse one pack with: list --pack <pack>`, `\n共 ${cat.elements.length} 个动画。使用 list --pack <分类包> 查看单包内容。`));
}

async function cmdGet(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) {
    const e = cat.elements.find((x) => x.id === id);
    files.push({ name: `${id}-${e.slug || 'element'}.txt`, text: await store.file(`${lang}/e/${id}.txt`) });
  }
  emit(files, flags.out);
  const kits = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  const note = msg(`Needs kit: ${kits.join(', ')} — run "kit <pack>" once per pack before using this code.`, `需要共享代码：${kits.join('、')}。使用前对每个分类包运行一次 kit <分类包>；代码标识符与原作者版权行保持原样。`);
  if (flags.out) console.log(note); else process.stdout.write(`\n// ${note}\n`);
}

async function cmdPrompt(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) files.push({ name: `${id}-prompt.txt`, text: await store.file(`${lang}/p/${id}.txt`) });
  emit(files, flags.out);
}

async function cmdKit(store, args, flags) {
  if (args.length !== 1) throw new CliError(EXIT.USAGE, msg('kit needs exactly one pack name, e.g. "kit motion".', 'kit 需要一个分类包名称，例如 kit motion。'));
  const cat = await store.loadCatalog();
  const pack = requirePack(cat, args[0]);
  emit([{ name: `kit-${pack}.js`, text: await store.file(`kit/${pack}.js`) }], flags.out);
}

async function cmdInfo(store) {
  console.log(`motion-prompt-zh Skill ${VERSION}`);
  console.log(msg(`Gallery (configured): ${SITE}`, `配置站点（本命令不验证已上线）：${SITE}`));
  console.log(msg(`Repository: ${CONFIG.repo}`, `仓库地址：${CONFIG.repo}`));
  console.log(msg(`API base: ${CONFIG.apiBase}`, `线上 API 配置：${CONFIG.apiBase}`));
  const origin = store.origin === 'local clone' ? '本地中文版仓库' : store.origin === 'default' ? '独立安装默认配置' : store.origin;
  console.log(msg(`Sources (${store.origin}):`, `数据来源（${origin}）：`));
  for (const b of store.bases) console.log(`  ${b}`);
  let cat = null;
  let error = null;
  try { cat = await store.loadCatalog(); } catch (err) { error = err; }
  console.log(msg(`Cache folder: ${store.remote ? store.cacheDir() : '(not used for local files)'}`, `缓存目录：${store.remote ? store.cacheDir() : '本地文件不使用下载缓存'}`));
  if (!cat) { console.log(msg('Catalog: unavailable', '目录：不可用')); throw error; }
  console.log(msg(`In use: ${store.fromCache ? 'disk cache' : store.usedBase}`, `当前读取：${store.fromCache ? '磁盘缓存，原始来源 ' + (store.usedBase || '未知') : store.usedBase}`));
  console.log(msg(`Catalog: version ${cat.version ?? '?'} · ${cat.elements.length} elements`, `目录：版本 ${cat.version ?? '?'} · ${cat.elements.length} 个元素`));
  for (const p of packsOf(cat)) {
    const n = cat.elements.filter((e) => e.pack === packKey(p)).length;
    if (n) console.log(`  ${packKey(p)}: ${n}`);
  }
  console.log(`Node:           ${process.version}`);
}

// ---------- pick: the user chooses in the gallery, the choice comes back here ----------
// A small HTTP server on 127.0.0.1 waits for one GET /?t=<token>&ids=012,045&note=…&lang=ja. The gallery sends it
// as a top-level navigation ("Send to AI"), because an https page may not fetch() from 127.0.0.1.

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.tsv': 'text/tab-separated-values; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

function repoRoot() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..');
  return fs.existsSync(path.join(dir, 'index.html')) && fs.existsSync(path.join(dir, 'assets', 'site.js')) ? dir : null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(lang, title, body) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><link rel="icon" href="data:,"><title>${esc(title)} | Motion Prompt</title>
<style>body{margin:0;font:16px/1.7 system-ui,"Hiragino Sans","Yu Gothic",sans-serif;background:Canvas;color:CanvasText}
main{max-width:34em;margin:12vh auto;padding:0 16px}h1{font-size:24px;line-height:1.4;margin:0 0 8px}p{margin:0 0 12px}
ol{padding-left:1.4em;margin:16px 0}li{margin:2px 0}code{font-family:ui-monospace,Menlo,monospace;opacity:.7;margin-right:.5em}</style>
</head><body><main><h1>${esc(title)}</h1>${body}</main></body></html>`;
}

function send(res, status, html, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(html);
}

function serveStatic(root, pathname, req, res) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return send(res, 400, 'Bad request'); }
  if (rel.includes('\0') || /(^|\/)\./.test(rel)) return send(res, 404, 'Not found');
  let file = path.join(root, rel);
  if (file !== root && !file.startsWith(root + path.sep)) return send(res, 404, 'Not found');
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { /* answered below */ }
  // Resolve symbolic links and check again, so a link inside the clone cannot expose files outside it.
  try {
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(file);
    if (realFile !== realRoot && !realFile.startsWith(realRoot + path.sep)) return send(res, 404, 'Not found');
    file = realFile;
  } catch { return send(res, 404, 'Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}

function openBrowser(url) {
  let cmd;
  let args;
  const opts = { detached: true, stdio: 'ignore', windowsHide: true };
  if (process.platform === 'darwin') { cmd = 'open'; args = [url]; }
  else if (process.platform === 'win32') { cmd = 'cmd'; args = ['/c', 'start', '""', `"${url}"`]; opts.windowsVerbatimArguments = true; }
  else { cmd = 'xdg-open'; args = [url]; }
  return new Promise((resolve) => {
    let child;
    try { child = spawn(cmd, args, opts); } catch { resolve(false); return; }
    child.once('error', () => resolve(false));
    child.once('spawn', () => { child.unref(); resolve(true); });
  });
}

const PICK_TEXT = {
  'zh-Hans': {
    done: '已发送给 AI', close: '可以关闭此页，回到 AI 对话中说明如何使用所选效果。',
    ignored: '以下编号不在目录中，未发送：', bad: '无法读取选择',
    badBody: '请返回效果库，重新点击“发送给 AI”。AI 仍在等待。',
    none: '所选编号均不在目录中', other: '此接收地址属于其他请求', otherBody: '请使用 AI 为本次任务打开的效果库发送选择。',
  },
  ja: {
    done: 'AIに渡しました', close: 'この画面は閉じて大丈夫です。AIの画面に戻って、どう使うかを伝えてください。',
    ignored: 'カタログに無い番号は渡していません: ', bad: '選択を読み取れませんでした',
    badBody: 'ギャラリーに戻って、もう一度「AIに渡す」を押してください。AIはまだ待っています。',
    none: '選んだ番号がカタログにありませんでした', other: 'この受け口は別の依頼の物です',
    otherBody: 'AIが開いたギャラリーの「AIに渡す」から送ってください。',
  },
  en: {
    done: 'Sent to your AI', close: 'You can close this page. Go back to your AI and tell it how to use the picks.',
    ignored: 'Not in the catalog, so not sent: ', bad: 'The selection could not be read',
    badBody: 'Go back to the gallery and press "Send to AI" again. Your AI is still waiting.',
    none: 'None of the picked numbers is in the catalog', other: 'This address belongs to another request',
    otherBody: 'Send your picks with "Send to AI" in the gallery that your AI opened.',
  },
};

function waitForPick(server, { port, token, root, cat, flags, timeoutSec }) {
  const origin = `http://127.0.0.1:${port}`;
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      server.close();
      if (server.closeAllConnections) server.closeAllConnections();
      fn();
    };
    const timer = setTimeout(() => finish(() => reject(new CliError(EXIT.TIMEOUT,
      msg(`motion-prompt: no selection arrived within ${timeoutSec} s, so nothing was picked.\nAsk the user whether they still want to pick, then run pick again.`, `等待 ${timeoutSec} 秒后仍未收到选择，本次未选取动画。若用户仍希望选择，请重新运行 pick。`)))), timeoutSec * 1000);

    server.on('request', (req, res) => {
      const host = String(req.headers.host || '').toLowerCase();
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 403, 'Forbidden'); // DNS rebinding
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
      let url;
      try { url = new URL(req.url, origin); } catch { return send(res, 400, 'Bad request'); }
      const q = url.searchParams;
      if (url.pathname === '/' && q.has('t')) {
        const lang = normalizeLang(q.get('lang')) || normalizeLang(flags.lang) || 'zh-Hans';
        const T = PICK_TEXT[lang];
        const given = Buffer.from(String(q.get('t')));
        const want = Buffer.from(token);
        if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
          return send(res, 403, page(lang, T.other, `<p>${esc(T.otherBody)}</p>`));
        }
        if (req.method !== 'GET') return send(res, 405, 'Method not allowed', { Allow: 'GET' });
        if (lang === 'zh-Hans') {
          try { requireChinese(cat, CONFIG.site); }
          catch (e) { return send(res, 400, page(lang, T.bad, `<p>${esc(e.message)}</p>`)); }
        }
        const raw = String(q.get('ids') || '');
        if (!/^\d{3}(,\d{3})*$/.test(raw)) {
          process.stderr.write(msg(`motion-prompt: refused a selection with malformed ids (${JSON.stringify(raw.slice(0, 80))}); still waiting.\n`, '已拒绝格式错误的动画编号，仍在等待有效选择。\n'));
          return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        }
        const ids = [...new Set(raw.split(','))];
        if (ids.length > PICK_MAX) return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        const known = ids.filter((id) => cat.elements.some((e) => e.id === id));
        const unknown = ids.filter((id) => !known.includes(id));
        if (!known.length) {
          process.stderr.write(msg(`motion-prompt: refused a selection with no known ids (${unknown.join(', ')}); still waiting.\n`, `所选编号均不在目录中（${unknown.join('、')}），仍在等待。\n`));
          return send(res, 400, page(lang, T.none, `<p>${esc(T.badBody)}</p>`));
        }
        const note = String(q.get('note') || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);
        const items = known.map((id) => {
          const e = cat.elements.find((x) => x.id === id);
          return `<li><code>#${id}</code>${esc(tx(e.name, lang))}</li>`;
        }).join('');
        const html = page(lang, T.done, `<p>${esc(T.close)}</p><ol>${items}</ol>${unknown.length ? `<p>${esc(T.ignored + unknown.map((u) => `#${u}`).join(', '))}</p>` : ''}`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'close' });
        res.end(html, () => finish(() => resolve({ ids: known, unknown, note, lang })));
        return;
      }
      if (root) return serveStatic(root, url.pathname, req, res);
      return send(res, 404, 'Not found');
    });
  });
}

function printPick(cat, { ids, unknown, note, lang }) {
  UI_LANG = lang;
  const other = lang === 'zh-Hans' || lang === 'ja' ? 'en' : 'ja';
  const out = [msg(`The user picked ${ids.length} element${ids.length === 1 ? '' : 's'} in the Motion Prompt gallery, in this order.`, `用户在 Motion Prompt 中文动效库中依次选择了 ${ids.length} 个动画。`)];
  out.push(msg(note ? `Note from the user: ${note}` : 'Note from the user: (none)', `用户备注：${note || '无'}`));
  out.push('');
  ids.forEach((id, i) => {
    const e = cat.elements.find((x) => x.id === id);
    const name = tx(e.name, lang);
    const alt = tx(e.name, other);
    out.push(`${i + 1}. #${e.id}  ${name}${alt && alt !== name ? ` / ${alt}` : ''}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]`);
    if (e.meaning) out.push(`   ${msg('Meaning', '效果解释')}：${tx(e.meaning, lang)}`);
    if (e.ask) out.push(`   ${msg('How to ask', '需求示例')}：${tx(e.ask, lang)}`);
    out.push(`   ${msg('Summary', '动画表现')}：${tx(e.summary, lang)}`);
    const spec = e.spec ? (Array.isArray(e.spec) ? e.spec : e.spec[lang] || e.spec.en || []) : [];
    if (spec.length) { out.push(msg('   Spec:', '   运动规格：')); for (const s of spec) out.push(`   - ${s}`); }
    out.push(`   ${msg('Demo (configured site)', '演示链接（配置站点）')}：${demoUrl(e.id, lang)}`);
    out.push('');
  });
  if (unknown.length) out.push(msg(`Ignored (not in the catalog): ${unknown.map((u) => `#${u}`).join(', ')}`, `已忽略未知编号：${unknown.map(u => '#' + u).join('、')}`), '');
  const packs = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  out.push(msg(`Next: use exactly these elements, no more and no fewer. Run "get ${ids.join(' ')}" for the code (at most ${MAX_GET} ids per call) and "kit <pack>" once for each of: ${packs.join(', ')}.`, `下一步：仅使用以上选择，先检查当前项目框架，再运行 get ${ids.join(' ')} --lang ${lang}（每次最多 ${MAX_GET} 项），并分别运行 ${packs.map(p => 'kit ' + p).join('、')}。根据真实规格与代码完成项目修改，保留关键参数，最后用中文报告实现位置与验证结果。`));
  process.stdout.write(`${out.join('\n')}\n`);
}

async function cmdPick(store, args, flags, lang) {
  if (args.length) throw new CliError(EXIT.USAGE, msg('pick takes no ids or words. Options: --pack <pack> --lang zh-Hans|en|ja --timeout <seconds> --no-open --local', 'pick 不接收编号或关键词，可用 --pack、--lang、--timeout、--no-open、--local。'));
  const timeoutSec = flags.timeout === undefined ? PICK_TIMEOUT : Number(flags.timeout);
  if (!Number.isFinite(timeoutSec) || timeoutSec < 1 || timeoutSec > 86400) throw new CliError(EXIT.USAGE, msg('--timeout must be a number of seconds between 1 and 86400.', '--timeout 必须是 1 到 86400 之间的秒数。'));
  const root = repoRoot(); // Development clones should not open an unpublished production site.
  if (flags.local && !root) throw new CliError(EXIT.USAGE, msg('--local needs a full clone of the repository (index.html and assets/ three folders above this script). Run pick without --local to use the public gallery.', '--local 需要完整中文版源码（含 index.html、assets 和 api/v1）。独立安装版请运行 pick 使用配置的站点。'));
  const cat = await store.loadCatalog(); // fail before opening anything if there is no data
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;

  const token = crypto.randomBytes(16).toString('hex');
  const server = http.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const q = new URLSearchParams({ cb: `${origin}/?t=${token}` });
  if (pack) q.set('pack', pack);
  q.set('lang', lang); // Explicitly override a previous English/Japanese browser preference.
  const galleryUrl = `${root ? `${origin}/` : SITE}?${q}`;
  const waiting = waitForPick(server, { port, token, root, cat, flags, timeoutSec });

  console.log(msg(`Gallery: ${galleryUrl}`, `动效库：${galleryUrl}`));
  if (flags['no-open']) console.log(msg('Not opened (--no-open). Open this URL in a browser, or give it to the user to open.', '已使用 --no-open，请在浏览器或 Codex 浏览器面板打开上方链接。'));
  else if (await openBrowser(galleryUrl)) console.log(msg('Opened in the default browser. If no browser window appeared, open the URL above yourself.', '已请求默认浏览器打开动效库；若未出现页面，可打开上方链接。'));
  else console.log(msg('Could not open a browser from here. Open the URL above in a browser, or give it to the user to open.', '当前环境无法自动打开浏览器，请打开上方链接。'));
  console.log(msg(`Waiting for the user to pick and press "Send to AI" (up to ${timeoutSec} s)…\n`, `正在等待用户选择并点击“发送给 AI”，最多等待 ${timeoutSec} 秒…\n`));

  printPick(cat, await waiting);
}

// ---------- main ----------

async function main() {
  const { flags, command, args } = parseArgs(process.argv.slice(2));
  if (flags.version) { console.log(VERSION); return; }
  if (flags.help || !command || command === 'help') { console.log(UI_LANG === 'zh-Hans' ? HELP_ZH : HELP); return; }
  if (flags.lang && !normalizeLang(flags.lang)) throw new CliError(EXIT.USAGE, msg('--lang must be zh-Hans, zh, en or ja.', '--lang 支持 zh-Hans、zh、en 或 ja。'));
  if (flags.lang) flags.lang = normalizeLang(flags.lang);
  const lang = flags.lang || (command === 'search' && HAS_JA.test(args.join(' ')) ? 'ja' : 'zh-Hans');
  UI_LANG = lang;
  const store = new Store({ refresh: flags.refresh });
  switch (command) {
    case 'search': return cmdSearch(store, args, flags, lang);
    case 'list': return cmdList(store, flags, lang);
    case 'get': return cmdGet(store, args, flags, lang);
    case 'prompt': return cmdPrompt(store, args, flags, lang);
    case 'kit': return cmdKit(store, args, flags);
    case 'info': return cmdInfo(store);
    case 'pick': return cmdPick(store, args, flags, lang);
    default: throw new CliError(EXIT.USAGE, msg(`Unknown command "${command}". Run with --help.`, `未知命令“${command}”，请运行 --help。`));
  }
}

main().catch((err) => {
  if (err instanceof CliError) { process.stderr.write(`${err.message}\n`); process.exitCode = err.code; return; }
  process.stderr.write(`motion-prompt: unexpected error: ${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
