import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostListener,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppCatalogService } from '../../../core/services/app-catalog.service';
import { AppEntry } from '../../../models/app.model';

@Component({
  selector: 'ui-global-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './global-nav.component.html',
  styleUrl: './global-nav.component.scss',
})
export class GlobalNavComponent implements OnInit {
  /** When true the nav starts transparent and becomes opaque on scroll */
  @Input() transparentOnTop = false;
  @Input() mode: 'default' | 'frosted' = 'default';

  private catalogService = inject(AppCatalogService);

  apps$: Observable<ReadonlyArray<AppEntry>> = of([]);

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  ngOnInit(): void {
    this.apps$ = this.catalogService.list().pipe(
      catchError(() => of([]))
    );
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
