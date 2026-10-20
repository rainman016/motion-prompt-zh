#!/usr/bin/env node
// Regression checks for Chinese data, generated resources, gallery and local Skill hand-off.
// MP_PLAYWRIGHT=/path/to/playwright node tools/check-localization.mjs [--static] [--screenshots dir]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from '../skills/motion-prompt-zh/scripts/config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const json = rel => JSON.parse(read(rel));
const CONFIG = resolveConfig(json('site.config.json'));
const args = process.argv.slice(2);
const shotIndex = args.indexOf('--screenshots');
const shots = shotIndex >= 0 ? path.resolve(args[shotIndex + 1]) : null;
const langs = ['zh-Hans', 'en', 'ja'];
const window = { MP_SITE_CONFIG: CONFIG };
vm.runInNewContext(read('assets/catalog.js'), { window });
const cat = window.MP_CATALOG;
assert.equal(cat.count, 144);
assert.equal(cat.packs.length, 6);
assert.equal(cat.site, CONFIG.site);
assert.equal(cat.repo, CONFIG.repo);
assert.equal(fs.existsSync(path.join(ROOT, 'api/v1/zh')), false);
for (const [i, el] of cat.elements.entries()) {
  assert.equal(el.id, String(i + 1).padStart(3, '0'));
  for (const key of ['name', 'meaning', 'ask', 'summary', 'use']) assert.match(el[key]['zh-Hans'], /[\u3400-\u9fff]/);
  const p = cat.packs.find(p => p.pack === el.pack);
  for (const lang of langs) {
    assert.equal(read(`api/v1/${lang}/p/${el.id}.txt`), window.MP_PROMPT(el, p.title[lang], lang, CONFIG.site, CONFIG.apiBase) + '\n');
    assert.match(read(`api/v1/${lang}/e/${el.id}.txt`), new RegExp('^// Motion Prompt #' + el.id + ' · MIT License \\(c\\) 2026 Shohei Ohtaki'));
  }
}
for (const p of cat.packs) {
  assert.equal(p.count, 24);
  assert.ok(read(`packs/${p.pack}/README.zh-Hans.md`).includes(p.title['zh-Hans']));
  assert.match(read(`api/v1/kit/${p.pack}.js`), /MIT License \(c\) 2026 Shohei Ohtaki/);
}
for (const lang of langs) assert.equal(read(`api/v1/${lang}/catalog.tsv`).trim().split('\n').length, 145);
assert.deepEqual(json('skills/motion-prompt-zh/scripts/site-config.json'), CONFIG);
const cli = ['skills/motion-prompt/scripts/motion-prompt.mjs'];
function runCli(words) {
  const r = spawnSync(process.execPath, [...cli, ...words], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.replace(/\r\n/g, '\n');
}
assert.match(runCli(['search', '弹性']), /#001/);
assert.match(runCli(['search', '遮罩']), /#005/);
assert.match(runCli(['search', '镜头推进']), /#027/);
assert.match(runCli(['search', 'typewriter']), /#006/);
assert.match(runCli(['search', '#144']), /#144/);
for (const lang of [...langs, 'zh']) assert.equal(runCli(['prompt', '012', '--lang', lang]).trim(), read(`api/v1/${lang === 'zh' ? 'zh-Hans' : lang}/p/012.txt`).trim());
console.log('PASS: 144 Chinese entries, 432 prompts match API, 432 code resources, 6 READMEs, CLI search/languages.');
if (args.includes('--static')) process.exit(0);

let chromium;
try { ({ chromium } = createRequire(import.meta.url)(process.env.MP_PLAYWRIGHT || 'playwright')); }
catch { console.error('Playwright unavailable. Static checks passed; browser checks NOT run. Set MP_PLAYWRIGHT.'); process.exit(2); }
const types = { '.js':'text/javascript', '.json':'application/json', '.html':'text/html', '.css':'text/css', '.svg':'image/svg+xml', '.txt':'text/plain', '.tsv':'text/tab-separated-values', '.png':'image/png', '.gif':'image/gif' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (rel.startsWith('/motion-prompt-zh/')) rel = rel.slice('/motion-prompt-zh'.length);
  const file = path.resolve(ROOT, '.' + (rel.endsWith('/') ? rel + 'index.html' : rel));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => { res.writeHead(err ? 404 : 200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' }); res.end(err ? 'Not found' : data); });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
try {
  browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await context.route('https://platform.twitter.com/**', route => route.abort());
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
  const open = async (suffix = '') => {
    await page.goto(base + '/motion-prompt-zh/' + suffix);
    await page.waitForFunction(() => document.querySelectorAll('.tile').length === 144 && Object.keys(window.MotionPrompt.packs).length === 6);
  };
  await open();
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  assert.equal(await page.locator('.tile-name').first().innerText(), '弹性弹入');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), CONFIG.site);
  assert.match(await page.title(), /144/);
  assert.equal(await page.locator('.seg-b').allTextContents().then(x => x.join('/')), 'ZH/EN/JA');
  assert.equal(await page.locator('.tile.is-broken').count(), 0);
  await page.locator('#play').click();
  assert.equal(await page.locator('#play').getAttribute('aria-pressed'), 'false');
  await page.locator('#play').click();
  assert.equal(await page.locator('#play').getAttribute('aria-pressed'), 'true');
  assert.equal(/[\u3040-\u30ff]/.test(await page.locator('body').innerText()), false, 'Untranslated Japanese outside Canvas');
  const searches = [['弹性', '001'], ['遮罩', '005'], ['镜头推进', '027'], ['typewriter', '006'], ['#144', '144'], ['012', '012']];
  for (const [term, id] of searches) {
    await page.locator('#q').fill(term);
    await page.waitForFunction(id => !document.querySelector('.tile[data-id="' + id + '"]').parentElement.hidden, id);
  }
  await page.locator('#q').fill('');
  await page.locator('[data-lang=en]').click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await open();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'Saved language without a URL override');
  assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), 'en_US');
  assert.deepEqual(await page.locator('meta[property="og:locale:alternate"]').evaluateAll(nodes => nodes.map(n => n.content)), ['zh_CN', 'ja_JP']);
  await open('?lang=ja');
  assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
  await open('?lang=zh');
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  assert.equal(new URL(page.url()).searchParams.get('lang'), 'zh-Hans');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  await open('?lang=invalid');
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  await open('?lang=zh-Hans#144');
  await page.waitForFunction(() => document.querySelector('#detail').open);
  assert.equal(await page.locator('#d-name').innerText(), '分屏');
  await page.locator('#d-prev').click();
  assert.equal(await page.locator('#d-name').innerText(), '爆炸分解图');
  await page.locator('#d-next').click();
  assert.equal(await page.locator('#d-name').innerText(), '分屏');
  assert.equal(await page.locator('#d-prompt').innerText(), read('api/v1/zh-Hans/p/144.txt').trim());
  await page.locator('#d-copy-prompt').click();
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), read('api/v1/zh-Hans/p/144.txt').trim());
  await page.locator('#d-pick').click();
  await page.locator('#d-close').click();
  await page.locator('[data-pick="005"]').click();
  await page.locator('#tray-note').fill('用于开场标题');
  await page.locator('#tray-main').click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /用于开场标题/);
  await page.locator('#tray-share').click();
  const share = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(share.startsWith(base + '/motion-prompt-zh/?'));
  assert.equal(new URL(share).searchParams.get('lang'), 'zh-Hans');
  assert.equal(new URL(share).searchParams.get('cb'), null);
  await page.goto(share);
  assert.equal(await page.locator('.tile-box.is-picked').count(), 2);
  await page.locator('#tray-clear').click();
  assert.equal(await page.locator('.tile-box.is-picked').count(), 0);
  await page.goto(base + '/motion-prompt-zh/found.html?lang=zh');
  await page.waitForSelector('.ex-intro');
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  assert.match(await page.locator('.ex-intro').first().innerText(), /六种/);
  for (const lang of ['en', 'ja', 'zh-Hans']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
  }
  await page.locator('a.logo').click();
  await page.waitForSelector('.tile');
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
  await page.goto(base + '/');
  await page.waitForSelector('.tile');
  assert.equal(await page.locator('.tile.is-broken').count(), 0);
  if (shots) fs.mkdirSync(shots, { recursive: true });
  for (const width of [1440, 390, 375, 361, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await open('?lang=zh-Hans');
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(el => {
      const r = el.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'absolute';
    }).slice(0, 8).map(el => el.className || el.id || el.tagName));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}: ${overflow.join(', ')}`);
    const controls = await page.locator('.seg').boundingBox();
    assert.ok(controls.x >= 0 && controls.x + controls.width <= width, `Language buttons outside viewport at ${width}`);
    assert.ok(await page.locator('.top-nav').evaluate(el => el.getBoundingClientRect().right <= document.documentElement.clientWidth), `Header overflow at ${width}`);
    if (shots) await page.screenshot({ path: path.join(shots, `gallery-${width}.png`) });
    await open('?lang=zh-Hans#001');
    await page.waitForFunction(() => document.querySelector('#detail').open);
    await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
    assert.ok(await page.locator('#d-copy-prompt').isVisible());
    if (shots) await page.screenshot({ path: path.join(shots, `detail-${width}.png`) });
  }
  console.log('PASS: default Chinese, aliases, URL/storage precedence, refresh, 3 languages, searches, detail, clipboard, picks, share, examples, root/subpath, 1440/390/375/361/320 layouts.');

  // Exercise the actual local CLI listener: the browser selects and sends back canonical Chinese.
  const child = spawn(process.execPath, [...cli, 'pick', '--local', '--no-open', '--lang', 'en', '--timeout', '30'], { cwd: ROOT, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', stderr = '';
  const result = new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', code => resolve(code)); });
  child.stdout.on('data', b => { output += b.toString(); });
  child.stderr.on('data', b => { stderr += b.toString(); });
  try {
    const until = Date.now() + 10000;
    let match;
    while (!(match = output.match(/http:\/\/127\.0\.0\.1:\d+\/\?[^\s]+/)) && Date.now() < until) await new Promise(r => setTimeout(r, 50));
    assert.ok(match, output + stderr);
    await page.goto(match[0]);
    await page.waitForSelector('[data-pick="012"]');
    await page.locator('[data-lang="zh-Hans"]').click();
    await page.locator('[data-pick="012"]').click();
    await page.locator('#tray-main').click();
    await page.waitForFunction(() => document.title === '已发送给 AI | Motion Prompt');
    assert.equal(await result, 0, stderr);
    assert.match(output, /#012.*形状变形/);
    assert.match(output, /四种形状/);
  } finally { child.kill(); }
  console.log('PASS: real Skill local pick → Chinese switch → Send to AI → callback acknowledgement and Chinese specs.');
  assert.deepEqual(errors, []);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
console.log('All localization checks passed.');
