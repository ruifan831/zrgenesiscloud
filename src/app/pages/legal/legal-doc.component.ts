import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import productRegistry from '../../../assets/legal/products.json';
const LEGAL_PRODUCTS: Record<string, { name: string }> = productRegistry;
import { MetaService } from '../../shared/seo/meta.service';

const SLUG_META: Record<string, { title: string; description: string }> = {
  'privacy': {
    title: '隐私政策 - CrewPilot 班管家',
    description: 'CrewPilot 班管家隐私政策，说明我们如何收集、使用和保护您的个人信息。',
  },
  'terms': {
    title: '用户协议 - CrewPilot 班管家',
    description: 'CrewPilot 班管家用户协议，使用本应用即表示您同意以下条款。',
  },
  'sdk-list': {
    title: '第三方 SDK 清单 - CrewPilot 班管家',
    description: 'CrewPilot 班管家集成的第三方 SDK 列表及其数据处理说明。',
  },
  'pii-collection': {
    title: '个人信息收集清单 - CrewPilot 班管家',
    description: 'CrewPilot 班管家个人信息收集清单，列出所有收集的个人信息字段及用途。',
  },
  'minor-protection': {
    title: '未成年人保护 - CrewPilot 班管家',
    description: 'CrewPilot 班管家未成年人保护声明，说明我们对未成年用户的保护措施。',
  },
};

const ALLOWED_SLUGS = Object.keys(SLUG_META);

@Component({
  selector: 'zrgenesiscloud-legal-doc',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './legal-doc.component.html',
  styleUrl: './legal-doc.component.scss',
})
export class LegalDocComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private metaService = inject(MetaService);
  private cdr = inject(ChangeDetectorRef);

  docTitle = '';
  docMeta = '';
  docHtml: SafeHtml = '';
  isLoading = true;
  isNotFound = false;

  ngOnInit(): void {
    const slug = this.route.snapshot.data['legalSlug'] ?? this.route.snapshot.paramMap.get('slug') ?? '';

    const product = this.route.snapshot.paramMap.get('product');
    const registered = !!product && Object.hasOwn(LEGAL_PRODUCTS, product);
    if ((product && !registered) || !(registered ? ['privacy', 'terms'] : ALLOWED_SLUGS).includes(slug)) {
      this.isLoading = false;
      this.isNotFound = true;
      this.metaService.setForLegal('页面未找到');
      this.cdr.markForCheck();
      return;
    }

    const productName = registered ? LEGAL_PRODUCTS[product!].name : '';
    const meta = registered ? { title: `${productName}${slug === 'privacy' ? '隐私政策' : '用户协议'}`, description: `${productName}服务及个人信息处理说明。` } : SLUG_META[slug];
    this.metaService.setForLegal(meta.title, meta.description);

    // Add noindex for legal docs
    document.querySelector('meta[name="robots"]')?.remove();
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'noindex, nofollow';
    document.head.appendChild(robotsMeta);

    this.http
      .get(`/assets/legal/${registered ? product : 'crewpilot'}/${slug}.md`, { responseType: 'text' })
      .subscribe({
        next: (markdown) => {
          const lines = markdown.split('\n');

          // Extract H1 title from first heading line
          const h1Line = lines.find((l) => l.trim().startsWith('# '));
          this.docTitle = h1Line ? h1Line.replace(/^#+\s*/, '').trim() : meta.title;

          // Extract "上次更新" date from blockquote lines
          const dateLine = lines.find(
            (l) => l.includes('上次更新') || l.includes('最后更新') || l.includes('生效日期') || l.includes('版本日期')
          );
          this.docMeta = dateLine ? dateLine.replace(/^>?\s*/, '').trim() : '';

          const rawHtml = (marked.parse(markdown) as string).replace(/<h1>.*?<\/h1>/s, '');
          this.docHtml = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.isNotFound = true;
          this.cdr.markForCheck();
        },
      });
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }
}
