import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { AppEntry } from '../../models/app.model';

export interface PageMetaInput {
  title: string;
  description?: string;
  ogImage?: string;
  keywords?: string;
}

@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly siteName = 'ZRGenesis';

  constructor(private title: Title, private meta: Meta) {}

  setPageMeta(input: PageMetaInput): void {
    const fullTitle = input.title.includes(this.siteName)
      ? input.title
      : `${input.title} — ${this.siteName}`;

    this.title.setTitle(fullTitle);

    if (input.description) {
      this.meta.updateTag({ name: 'description', content: input.description });
      this.meta.updateTag({ property: 'og:description', content: input.description });
    }

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    if (input.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: input.ogImage });
    }

    if (input.keywords) {
      this.meta.updateTag({ name: 'keywords', content: input.keywords });
    }
  }

  setForHome(): void {
    this.setPageMeta({
      title: `${this.siteName} · 精心打造每一款应用`,
      description: 'ZRGenesis 旗下应用：全民万年黄历通、全能提词器、闪映。下载我们精心打造的移动应用。',
      keywords: '全民万年黄历通,全能提词器,闪映,ZRGenesis,App下载,安卓应用,iOS应用',
    });
  }

  setForApp(app: AppEntry): void {
    const seo = app.seo ?? {};
    this.setPageMeta({
      title: seo.title ?? app.name,
      description: seo.description ?? app.subtitle,
      ogImage: seo.ogImage ?? app.heroImage,
      keywords: `${app.name},${this.siteName},App下载,应用下载`,
    });
  }

  setForPrivacyIndex(): void {
    this.setPageMeta({
      title: '隐私与协议',
      description: 'ZRGenesis 旗下各应用的隐私政策与用户协议汇总，了解我们如何处理您的数据。',
      keywords: '隐私政策,用户协议,ZRGenesis,数据保护',
    });
  }

  setForLegal(pageTitle: string, description?: string): void {
    this.setPageMeta({
      title: pageTitle,
      description: description ?? `${pageTitle} — ZRGenesis 应用数据保护声明。`,
      keywords: '隐私政策,ZRGenesis,数据保护',
    });
  }

  setForContact(): void {
    this.setPageMeta({
      title: '联系我们',
      description: 'ZRGenesis 联系方式，欢迎通过邮件与我们取得联系。',
    });
  }
}
