// Export the public site's single source into the existing four-client URL host.
// Generated templates are checked in so scheduling-web still builds independently.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { renderLegalDocument } from './prerender-legal.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = resolve(root, '../scheduling-web/src/app/features/legal');
const documents = { privacy: 'privacy-policy', terms: 'terms-of-service' };
const classes = {
  h2: 'text-lg font-semibold tracking-[-0.01em] mt-8 mb-3',
  h3: 'font-semibold mt-6 mb-2',
  p: 'my-3',
  ul: 'space-y-2 list-disc pl-5 marker:text-[#0066cc] my-3',
  ol: 'space-y-2 list-decimal pl-5 marker:text-[#0066cc] my-3',
  a: 'text-[#0066cc] underline break-words',
};

export function renderCrewpilotTemplate(markdown, slug) {
  if (!Object.hasOwn(documents, slug) || !markdown.startsWith('# 班管家') || /\{\{|<script\b/i.test(markdown)) {
    throw new Error('Invalid CrewPilot legal source');
  }
  const rendered = marked.parse(markdown);
  const body = rendered.replace(/^<h1>.*?<\/h1>\s*/s, '').replace(/^<blockquote>.*?<\/blockquote>\s*/s, '');
  const dates = rendered.match(/<blockquote>\s*<p>(.*?)<\/p>\s*<\/blockquote>/s)?.[1];
  if (!dates) throw new Error('Missing legal dates');
  const styled = body
    .replace(/href="\/legal\/crewpilot\/(privacy|terms)\//g, 'href="/legal/$1')
    .replace(/<(h2|h3|p|ul|ol|a)(?=[\s>])/g, (_, tag) => `<${tag} class="${classes[tag]}"`);
  const title = slug === 'privacy' ? '隐私政策' : '用户协议';
  const otherSlug = slug === 'privacy' ? 'terms' : 'privacy';
  const otherTitle = slug === 'privacy' ? '用户协议' : '隐私政策';
  // Escape Angular control-flow characters in otherwise static trusted HTML.
  return `<!-- Generated from zrgenesiscloud/src/assets/legal/crewpilot/${slug}.md. Run npm run sync:legal; do not edit. -->
<div class="min-h-screen bg-white text-[#1d1d1f] antialiased">
  <article class="max-w-[720px] mx-auto px-6 py-12 sm:py-16">
    <header class="mb-10">
      <p class="text-xs tracking-[0.18em] text-[#7a7a7a] uppercase mb-3">CrewPilot · 班管家</p>
      <h1 class="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight mb-3">${title}</h1>
      <p class="text-sm text-[#7a7a7a]">${dates}</p>
    </header>
    <section class="text-[15px] leading-7 text-[#25231f]">${styled}</section>
    <footer class="mt-12 pt-6 border-t border-[#e5e5e5] flex items-center justify-between text-xs text-[#7a7a7a]">
      <span>© CrewPilot · 班管家</span>
      <a href="/legal/${otherSlug}" class="text-[#0066cc] hover:underline">查看《${otherTitle}》</a>
    </footer>
  </article>
</div>
`.replaceAll('@', '&#64;').replaceAll('{', '&#123;').replaceAll('}', '&#125;');
}

export function renderCrewpilotLegacyDocument(markdown, slug) {
  return renderLegalDocument(slug, markdown, 'crewpilot')
    .replace(/href="\/legal\/crewpilot\/(privacy|terms)\//g, 'href="/legal/$1');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputFlag = process.argv.indexOf('--output-directory');
  if (outputFlag >= 0 && !process.argv[outputFlag + 1]) throw new Error('Missing output directory');
  if (outputFlag >= 0 && process.argv.includes('--check')) throw new Error('Choose export or check');
  for (const [slug, name] of Object.entries(documents)) {
    const markdown = await readFile(resolve(root, `src/assets/legal/crewpilot/${slug}.md`), 'utf8');
    if (outputFlag >= 0) {
      const directory = resolve(process.argv[outputFlag + 1], `legal/${slug}`);
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, 'index.html'), renderCrewpilotLegacyDocument(markdown, slug));
      continue;
    }
    const template = renderCrewpilotTemplate(markdown, slug);
    const path = resolve(target, `${name}.generated.html`);
    if (process.argv.includes('--check')) {
      if (await readFile(path, 'utf8') !== template) throw new Error(`Stale legal template: ${path}`);
    } else {
      await writeFile(path, template);
    }
  }
  console.log(outputFlag >= 0 ? 'CrewPilot standalone legal pages exported.' : process.argv.includes('--check') ? 'CrewPilot legal templates are current.' : 'CrewPilot legal templates exported.');
}
