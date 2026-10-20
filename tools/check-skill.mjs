#!/usr/bin/env node
// Tests the real Skill CLI locally, as a standalone install, and through the browser callback.
// MP_PLAYWRIGHT=/path/to/playwright node tools/check-skill.mjs [--static]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'skills/motion-prompt-zh/scripts/motion-prompt.mjs');
const LEGACY = path.join(ROOT, 'skills/motion-prompt/scripts/motion-prompt.mjs');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const catalog = JSON.parse(read('api/v1/catalog.json'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-prompt-zh-skill-'));
const env = { ...process.env, MOTION_PROMPT_BASE: '', MOTION_PROMPT_CACHE: path.join(tmp, 'cache') };
function cli(words, extra = {}, script = CLI) {
  const child = spawn(process.execPath, [script, ...words], { cwd: tmp, env: { ...env, ...extra }, windowsHide: true });
  let stdout = '', stderr = '';
  child.stdout.on('data', b => { stdout += b; }); child.stderr.on('data', b => { stderr += b; });
  const done = new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => resolve({ code, stdout: stdout.replace(/\r\n/g, '\n'), stderr: stderr.replace(/\r\n/g, '\n') })); });
  return { child, done, output: () => stdout };
}
async function run(words, extra, script, code = 0) {
  const r = await cli(words, extra, script).done;
  assert.equal(r.code, code, r.stderr + r.stdout);
  return r;
}
let server, browser;
try {
  const info = await run(['info']);
  assert.match(info.stdout, /本地中文版仓库/); assert.match(info.stdout, /144 个元素/);
  const legacy = await run(['info'], {}, LEGACY);
  assert.equal(legacy.stdout, info.stdout);
  assert.equal((await run(['list', '--lang', 'zh-Hans'])).stdout.match(/^  - /gm).length, 18);
  const queries = [['弹性', '001'], ['选择与切换', '059'], ['前两个开关', '059'], ['拉焦', '033'], ['typewriter', '006'], ['ポップイン', '001']];
  for (const [term, id] of queries) assert.ok((await run(['search', term, '--limit', '50'])).stdout.includes('#' + id), term);
  for (const lang of ['zh-Hans', 'zh', 'en', 'ja']) {
    const actual = lang === 'zh' ? 'zh-Hans' : lang;
    const get = await run(['get', '012', '--lang', lang]);
    assert.ok(get.stdout.startsWith(read(`api/v1/${actual}/e/012.txt`).trimEnd()));
    assert.match(get.stdout, /^\/\/ Motion Prompt #012 · MIT License \(c\) 2026 Shohei Ohtaki · https:\/\/showheyohtaki\.github\.io\/motion-prompt\/#012/); assert.match(get.stdout, /CELLS\[11\]/);
    assert.equal((await run(['prompt', '012', '--lang', lang])).stdout.trimEnd(), read(`api/v1/${actual}/p/012.txt`).trimEnd());
  }
  assert.equal((await run(['kit', 'ui'])).stdout.trimEnd(), read('api/v1/kit/ui.js').trimEnd());
  assert.match((await run(['kit', 'ui'])).stdout, /^\/\/ Motion Prompt #049-072 .*https:\/\/showheyohtaki\.github\.io\/motion-prompt\/#049/);
  assert.match((await run(['get', '999'], {}, CLI, 1)).stderr, /找不到动画/);
  assert.match((await run(['--help'])).stdout, /用法/);
  const english = JSON.parse(JSON.stringify(catalog)); delete english.elements[0].name['zh-Hans'];
  const wrong = path.join(tmp, 'wrong'); fs.mkdirSync(wrong); fs.writeFileSync(path.join(wrong, 'catalog.json'), JSON.stringify(english));
  assert.match((await run(['info'], { MOTION_PROMPT_BASE: wrong }, CLI, 1)).stderr, /缺少完整简体中文.*#001/);
  assert.match((await run(['list', '--lang', 'en'], { MOTION_PROMPT_BASE: wrong })).stdout, /Motion graphics/);
  const missing = path.join(tmp, 'missing'); fs.mkdirSync(missing); fs.writeFileSync(path.join(missing, 'catalog.json'), JSON.stringify(catalog));
  assert.match((await run(['get', '012'], { MOTION_PROMPT_BASE: missing }, CLI, 1)).stderr, /缺少资源：zh-Hans\/e\/012.txt/);
  fs.mkdirSync(path.join(missing, 'zh-Hans/e'), { recursive: true });
  fs.writeFileSync(path.join(missing, 'zh-Hans/e/012.txt'), read('api/v1/en/e/012.txt'));
  assert.match((await run(['get', '012'], { MOTION_PROMPT_BASE: missing }, CLI, 1)).stderr, /未使用英文替代/);
  // A separately hosted API must also appear in copied prompts/reference headers, not only CLI fetches.
  const scratch = path.join(tmp, 'custom-build');
  for (const rel of ['index.html', 'found.html', 'assets/site.js', 'assets/found.js', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', '.github/ISSUE_TEMPLATE/2-example.yml', '.github/ISSUE_TEMPLATE/config.yml']) {
    const dest = path.join(scratch, rel); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, read(rel));
  }
  fs.cpSync(path.join(ROOT, 'packs'), path.join(scratch, 'packs'), { recursive: true });
  const customConfig = JSON.parse(read('site.config.json')); customConfig.apiBase = 'https://api.example.test/custom/v1';
  fs.writeFileSync(path.join(scratch, 'site.config.json'), JSON.stringify(customConfig));
  await run(['--root', scratch], {}, path.join(ROOT, 'tools/build.mjs'));
  const customRead = rel => fs.readFileSync(path.join(scratch, rel), 'utf8');
  assert.ok(customRead('api/v1/zh-Hans/p/012.txt').includes(customConfig.apiBase + '/zh-Hans/e/012.txt'));
  assert.ok(customRead('api/v1/zh-Hans/e/012.txt').includes(customConfig.apiBase + '/kit/motion.js'));
  const web = { window: {} };
  vm.runInNewContext(customRead('assets/site-config.js'), web); vm.runInNewContext(customRead('assets/catalog.js'), web);
  assert.ok(web.window.MP_PROMPT(catalog.elements[11], catalog.packs[0].title['zh-Hans'], 'zh-Hans').includes(customConfig.apiBase + '/zh-Hans/e/012.txt'));
  console.log('PASS A: real CLI info/list/search/get/prompt/kit, 144 entries, all languages, legacy path, explicit missing/wrong Chinese errors.');
  console.log('PASS configuration: custom API URL reaches built prompts, reference headers and browser prompt output.');
  if (process.argv.includes('--static')) process.exitCode = 0;
  else {
    // A copy under .agents/skills has no access to the source layout unless explicitly configured.
    const installed = path.join(tmp, 'consumer/.agents/skills/motion-prompt-zh');
    fs.cpSync(path.join(ROOT, 'skills/motion-prompt-zh'), installed, { recursive: true });
    const installedCli = path.join(installed, 'scripts/motion-prompt.mjs');
    const requests = [];
    const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css', '.svg':'image/svg+xml', '.txt':'text/plain', '.tsv':'text/plain' };
    server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); requests.push(pathname);
      if (pathname.startsWith('/primary/api/v1/')) { res.writeHead(404).end('Not published'); return; }
      const rel = pathname.startsWith('/backup/api/v1/') ? 'api/v1/' + pathname.slice('/backup/api/v1/'.length)
        : pathname.startsWith('/motion-prompt-zh/') ? pathname.slice('/motion-prompt-zh/'.length) || 'index.html' : '';
      const file = path.resolve(ROOT, rel);
      if (!rel || !file.startsWith(ROOT + path.sep)) { res.writeHead(404).end(); return; }
      fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, { 'Content-Type': (MIME[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' }); res.end(error ? 'Not found' : data); });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const config = JSON.parse(fs.readFileSync(path.join(installed, 'scripts/site-config.json'), 'utf8'));
    Object.assign(config, { site: origin + '/motion-prompt-zh/', apiBase: origin + '/primary/api/v1', rawApiBase: origin + '/backup/api/v1' });
    fs.writeFileSync(path.join(installed, 'scripts/site-config.json'), JSON.stringify(config));
    const standalone = await run(['info'], {}, installedCli);
    assert.match(standalone.stdout, /独立安装默认配置/); assert.match(standalone.stdout, /144 个元素/);
    assert.match(standalone.stderr, /备用来源.*backup\/api\/v1/);
    assert.equal((await run(['prompt', '012'], {}, installedCli)).stdout.trimEnd(), read('api/v1/zh-Hans/p/012.txt').trimEnd());
    const cache = await run(['info'], {}, installedCli); assert.match(cache.stderr, /使用缓存.*backup\/api\/v1/);
    assert.match((await run(['info'], { MOTION_PROMPT_BASE: path.join(ROOT, 'api/v1') }, installedCli)).stdout, /MOTION_PROMPT_BASE/);
    const { chromium } = createRequire(import.meta.url)(process.env.MP_PLAYWRIGHT || 'playwright');
    browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    async function pick(script, words, ids, note, online = false) {
      const p = cli(['pick', '--timeout', '25', ...words], {}, script);
      try {
        let match, end = Date.now() + 10000;
        while (!(match = p.output().match(/http:\/\/127\.0\.0\.1:\d+\/[^\s]*/)) && Date.now() < end) await new Promise(r => setTimeout(r, 40));
        assert.ok(match, p.output());
        const url = new URL(match[0]); assert.equal(url.searchParams.get('lang'), 'zh-Hans');
        const cb = new URL(url.searchParams.get('cb')); assert.equal(cb.hostname, '127.0.0.1'); assert.match(cb.searchParams.get('t'), /^[a-f0-9]{32}$/);
        if (online) assert.equal(url.pathname, '/motion-prompt-zh/'); else assert.equal(url.port, cb.port);
        const badToken = new URL(cb); badToken.searchParams.set('t', 'wrong'); badToken.searchParams.set('ids', '059');
        assert.equal((await fetch(badToken)).status, 403);
        const malformed = new URL(cb); malformed.searchParams.set('ids', 'bad'); assert.equal((await fetch(malformed)).status, 400);
        const post = await fetch(cb, { method: 'POST' }); assert.equal(post.status, 405);
        if (!online) assert.equal((await fetch(cb.origin + '/.git/config')).status, 404);
        await page.goto(url.href);
        await page.waitForFunction(() => document.querySelectorAll('.tile').length === 144);
        assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans');
        for (const id of ids) await page.locator(`[data-pick="${id}"]`).click();
        const toggle = page.locator('#tray-toggle');
        if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
        await page.locator('#tray-note').fill(note);
        await page.locator('#tray-main').click();
        await page.waitForFunction(() => document.title === '已发送给 AI | Motion Prompt');
        const result = await p.done; assert.equal(result.code, 0, result.stderr);
        for (const id of ids) {
          const e = catalog.elements.find(e => e.id === id);
          assert.ok(result.stdout.includes('#' + id)); assert.ok(result.stdout.includes(e.name['zh-Hans'])); assert.ok(result.stdout.includes(e.name.en));
          assert.ok(result.stdout.includes(e.meaning['zh-Hans'])); assert.ok(e.spec['zh-Hans'].every(s => result.stdout.includes(s)));
        }
        assert.ok(result.stdout.includes(note)); assert.match(result.stdout, /演示链接/); assert.match(result.stdout, /get .*--lang zh-Hans/);
        return result;
      } finally { p.child.kill(); }
    }
    // Explicit local invocation; --no-open uses the same URL in the automated browser.
    await pick(CLI, ['--local', '--lang', 'zh-Hans', '--no-open'], ['012', '059'], '开场与通知设置，保留现有业务逻辑');
    // No --local and no --lang: development mode must still select the local Chinese gallery.
    const handoff = await pick(CLI, ['--no-open'], ['059'], '用于当前项目的通知开关');
    if (process.argv.includes('--handoff-out')) {
      const dest = path.resolve(process.argv[process.argv.indexOf('--handoff-out') + 1]); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, handoff.stdout);
    }
    // A genuinely isolated installed Skill loads HTTP API data and opens the configured subpath.
    await pick(installedCli, ['--no-open', '--lang', 'zh'], ['059', '060'], '在线中文版回传的中文备注', true);
    await page.goto(origin + '/motion-prompt-zh/?lang=zh-Hans&pick=059');
    assert.equal(await page.locator('#tray-main').innerText(), '复制所选'); assert.equal(await page.locator('#tray-wait').isVisible(), false);
    await page.goto(origin + '/motion-prompt-zh/?pick=059&cb=' + encodeURIComponent('https://example.com/'));
    assert.equal(await page.locator('#tray-main').innerText(), '复制所选');
    assert.deepEqual(errors, []);
    await context.close();
    await browser.close(); browser = null;
    await new Promise(resolve => server.close(resolve)); server = null;
    const offline = await run(['prompt', '012', '--refresh'], {}, installedCli);
    assert.match(offline.stderr, /离线目录缓存/); assert.match(offline.stderr, /使用缓存.*backup\/api\/v1/);
    assert.equal(offline.stdout.trimEnd(), read('api/v1/zh-Hans/p/012.txt').trimEnd());
    assert.ok(requests.some(p => p === '/primary/api/v1/catalog.json'));
    assert.ok(requests.some(p => p === '/backup/api/v1/catalog.json'));
    console.log('PASS B: real browser multi-pick + Chinese note + callback; local defaults, standalone HTTP subpath, safe callback rejection, normal copy mode.');
    console.log('PASS sources: isolated installation, configured primary/backup, explicit custom local source, provenance-aware offline cache; no upstream API fallback.');
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  // Only remove this tool-created temp tree; never remove a caller-supplied path.
  assert.equal(path.dirname(tmp), os.tmpdir()); assert.ok(path.basename(tmp).startsWith('motion-prompt-zh-skill-'));
  fs.rmSync(tmp, { recursive: true, force: true });
}
