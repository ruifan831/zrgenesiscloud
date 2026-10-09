import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { marked } from 'marked';

const root = fileURLToPath(new URL('../', import.meta.url));
const products = JSON.parse(await readFile(resolve(root, 'src/assets/legal/products.json'), 'utf8'));
const documents = { privacy: '隐私政策', terms: '用户协议' };
const style = `:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:#1b2536;font:16px/1.85 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:800px;margin:40px auto;padding:40px;background:white;border-radius:16px}nav{display:flex;flex-wrap:wrap;gap:20px;margin-bottom:28px}a{color:#245eea;text-underline-offset:4px}a:focus-visible{outline:2px solid #245eea;outline-offset:4px}h1{font-size:30px;line-height:1.4}h2{font-size:21px;margin-top:36px}h3{font-size:18px}blockquote{margin:0;color:#626c7c}table{border-collapse:collapse;width:100%;display:block;overflow:auto}td,th{border:1px solid #dfe3e8;padding:10px;text-align:left;min-width:100px}footer{margin-top:40px;border-top:1px solid #dfe3e8;padding-top:20px;font-size:14px}@media(max-width:600px){main{margin:0;padding:24px 20px;border-radius:0}h1{font-size:26px}}@media(prefers-color-scheme:dark){body{background:#14171e;color:#e6e9ef}main{background:#1d222c}a{color:#95b8ff}blockquote{color:#adb6c4}}@media print{nav{display:none}main{margin:0;max-width:none;padding:0}body,main{background:white;color:black}}`;

export function renderLegalDocument(slug, markdown, product = 'ticidashi') {
  if (!Object.hasOwn(documents, slug)) throw new Error('Unknown legal document');
  if (!Object.hasOwn(products, product)) throw new Error('Unknown legal product');
  const name = products[product].name;
  const title = `${name}${documents[slug]}`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${title}，说明应用服务及个人信息处理规则。"><link rel="canonical" href="https://www.zrgenesiscloud.com/legal/${product}/${slug}/"><style>${style}</style></head><body><main><nav aria-label="法律文档"><a href="/">卓瑞云创</a><a href="/legal/${product}/privacy/">隐私政策</a><a href="/legal/${product}/terms/">用户协议</a></nav><article>${marked.parse(markdown)}</article><footer>上海卓瑞云创信息技术有限公司 · ${name}</footer></main></body></html>`;
}

export async function prerenderLegal({ outputDirectory = resolve(root, 'dist/zrgenesiscloud/browser') } = {}) {
  // Render from the same Markdown copied by Angular, so the uploaded artifact is self-contained.
  await access(resolve(outputDirectory, 'index.html'));
  const pages = await Promise.all(Object.keys(products).flatMap(product => Object.keys(documents).map(async slug => {
    const extension = 'md';
    const source = await readFile(resolve(outputDirectory, `assets/legal/${product}/${slug}.${extension}`), 'utf8');
    const validHeading = source.startsWith('# ') && source.split('\n')[0].includes(products[product].name);
    if (!validHeading || /\{\{|<script\b|\son[a-z]+\s*=/i.test(source)) throw new Error(`Invalid legal source: ${product}/${slug}`);
    return { product, slug, html: renderLegalDocument(slug, source, product) };
  })));

  for (const { product, slug, html } of pages) {
    const destination = resolve(outputDirectory, `legal/${product}/${slug}/index.html`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  return pages.map(page => `legal/${page.product}/${page.slug}/index.html`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pages = await prerenderLegal();
  console.log(`Legal pages prerendered: ${pages.join(', ')}.`);
}
