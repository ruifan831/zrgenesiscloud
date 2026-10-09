import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, cp, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prerenderLegal, renderLegalDocument } from './prerender-legal.mjs';
async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'zr-legal-'));
  await writeFile(join(dir, 'index.html'), '<app-root></app-root>');
  await mkdir(join(dir, 'assets'), { recursive: true });
  await cp(new URL('../src/assets/legal', import.meta.url), join(dir, 'assets/legal'), { recursive: true });
  return dir;
}
test('registered products render Markdown under one URL prefix without legacy aliases', async () => {
  const outputDirectory = await fixture();
  try {
    const registry = JSON.parse(await readFile(new URL('../src/assets/legal/products.json', import.meta.url), 'utf8'));
    const pages = await prerenderLegal({ outputDirectory });
    assert.equal(pages.length, Object.keys(registry).length * 2);
    for (const [product, { name }] of Object.entries(registry)) {
      for (const slug of ['privacy', 'terms']) {
        const html = await readFile(join(outputDirectory, `legal/${product}/${slug}/index.html`), 'utf8');
        assert.ok(html.includes(name));
        assert.match(html, /<h1>/);
        assert.match(html, /上海卓瑞云创信息技术有限公司/);
        assert.ok(html.includes(`href="https://www.zrgenesiscloud.com/legal/${product}/${slug}/"`));
        assert.doesNotMatch(html, /<script|<app-root|\{\{/);
      }
    }
    const privacy = await readFile(join(outputDirectory, 'legal/calendar/privacy/index.html'), 'utf8');
    for (const text of ['快手联盟 SDK 的设备 MAC 地址处理说明', 'NetworkInterface.getHardwareAddress', 'WeatherAPI', '头像', 'https://u.kuaishou.com/']) assert.ok(privacy.includes(text), text);
    for (const legacy of ['calendar/privacy/index.html', 'calendar/user-agreement/index.html', 'privacy/calendar/index.html', 'privacy/teleprompter/index.html', 'privacy-policy.html', 'chinese-almanc-user-agreement.html']) await assert.rejects(access(join(outputDirectory, legacy)));
    assert.equal(await readFile(join(outputDirectory, 'index.html'), 'utf8'), '<app-root></app-root>');
  } finally { await rm(outputDirectory, { recursive: true, force: true }); }
});
test('missing calendar terms fails before writing any product page', async () => {
  const outputDirectory = await fixture();
  try {
    await rm(join(outputDirectory, 'assets/legal/calendar/terms.md'));
    await assert.rejects(prerenderLegal({ outputDirectory }));
    await assert.rejects(access(join(outputDirectory, 'legal/ticidashi/privacy/index.html')));
    assert.throws(() => renderLegalDocument('../unknown', 'text'));
    assert.throws(() => renderLegalDocument('privacy', 'text', 'unknown'));
  } finally { await rm(outputDirectory, { recursive: true, force: true }); }
});
