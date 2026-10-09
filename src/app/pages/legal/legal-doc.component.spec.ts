import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { LegalDocComponent } from './legal-doc.component';

describe('shared legal document reader', () => {
  for (const product of ['calendar', 'ticidashi']) {
    it(`loads ${product} Markdown from the shared URL convention`, () => {
      TestBed.configureTestingModule({
        imports: [LegalDocComponent, HttpClientTestingModule],
        providers: [{ provide: ActivatedRoute, useValue: { snapshot: {
          data: {}, paramMap: convertToParamMap({ product, slug: 'privacy' }),
        } } }],
      });
      const fixture = TestBed.createComponent(LegalDocComponent);
      fixture.detectChanges();
      TestBed.inject(HttpTestingController).expectOne(`/assets/legal/${product}/privacy.md`)
        .flush('# 测试隐私政策\n\n快手联盟 SDK 读取设备 MAC 地址');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('设备 MAC 地址');
    });
  }
});
