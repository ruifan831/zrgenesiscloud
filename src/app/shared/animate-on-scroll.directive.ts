import {
  AfterViewInit,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * 当元素进入视口时给它加上 `.is-visible` 类，配合 SCSS 中的 keyframe 做
 * fade-in-up / scale-in 等淡入动画。可选 stagger 索引控制顺序延迟。
 *
 * 用法：
 *   <div appAnimateOnScroll>...</div>
 *   <div appAnimateOnScroll [stagger]="i">...</div>
 */
@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input() stagger = 0;
  @Input() threshold = 0.15;
  @Input() rootMargin = '0px 0px -10% 0px';

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = this.el.nativeElement;
    this.renderer.addClass(target, 'reveal-on-scroll');
    if (this.stagger) {
      this.renderer.setStyle(target, 'transition-delay', `${this.stagger * 80}ms`);
      this.renderer.setStyle(target, 'animation-delay', `${this.stagger * 80}ms`);
    }

    if (!('IntersectionObserver' in window)) {
      // 没有 IO 支持：直接显示
      this.renderer.addClass(target, 'is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.threshold, rootMargin: this.rootMargin }
    );

    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
