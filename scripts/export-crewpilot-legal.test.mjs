import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderCrewpilotTemplate, renderCrewpilotLegacyDocument } from './export-crewpilot-legal.mjs';
import { renderLegalDocument } from './prerender-legal.mjs';

test('canonical and existing client routes expose the same deletion rules and contact', async () => {
  const markdown = await readFile(new URL('../src/assets/legal/crewpilot/privacy.md', import.meta.url), 'utf8');
  const canonical = renderLegalDocument('privacy', markdown, 'crewpilot');
  const legacy = renderCrewpilotTemplate(markdown, 'privacy');
  for (const html of [canonical, legacy.replaceAll('&#64;', '@')]) {
    for (const text of ['5.1 账号注销流程与规则', '获取验证码', '仍要注销', '现金余额', '转让组织所有权', '不可恢复', '15 个工作日内回复处理情况', 'mailto:support@zrgenesiscloud.com', 'com.kwad.sdk', '软件安装列表']) {
      assert.ok(html.includes(text), text);
    }
    assert.match(html, /id="account-deletion"/);
    assert.match(html, /id="third-party-sdks"/);
    assert.doesNotMatch(html, /\{\{|待填字段|草案|yybcomplain/);
  }
  assert.match(canonical, /href="\/legal\/crewpilot\/privacy\/#third-party-sdks"/);
  assert.match(legacy, /href="\/legal\/privacy#third-party-sdks"/);
  assert.match(legacy, /href="https:\/\/crewpilot.zrgenesiscloud.com\/legal\/sdk-list"/);
});

test('legacy terms link to the deletion section without requiring canonical deployment', async () => {
  const markdown = await readFile(new URL('../src/assets/legal/crewpilot/terms.md', import.meta.url), 'utf8');
  const legacy = renderCrewpilotTemplate(markdown, 'terms');
  assert.match(legacy, /href="\/legal\/privacy#account-deletion"/);
  assert.match(legacy, /support&#64;zrgenesiscloud.com/);
  assert.doesNotMatch(legacy, /href="\/legal\/crewpilot\//);
  assert.throws(() => renderCrewpilotTemplate(markdown, '../unknown'));
  assert.throws(() => renderCrewpilotTemplate('# 班管家\n\n{{PLACEHOLDER}}', 'privacy'));
  assert.throws(() => renderCrewpilotTemplate('# 班管家\n\n<script>alert(1)</script>', 'privacy'));
});

test('standalone patch works on the existing host without Angular assets', async () => {
  const markdown = await readFile(new URL('../src/assets/legal/crewpilot/terms.md', import.meta.url), 'utf8');
  const html = renderCrewpilotLegacyDocument(markdown, 'terms');
  assert.match(html, /href="\/legal\/privacy#account-deletion"/);
  assert.match(html, /href="https:\/\/www.zrgenesiscloud.com\/legal\/crewpilot\/terms\/"/);
  assert.doesNotMatch(html, /<script|<app-root|stylesheet|href="\/legal\/crewpilot\//);
});
