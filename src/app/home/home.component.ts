import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, catchError } from 'rxjs';
import { AppCatalogService } from '../core/services/app-catalog.service';
import { MetaService } from '../shared/seo/meta.service';
import { AppEntry } from '../models/app.model';
import { RouterLink } from '@angular/router';
import { AppShowcaseComponent } from '../shared/ui/app-showcase/app-showcase.component';

@Component({
  selector: 'zrgenesiscloud-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, AppShowcaseComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private catalogService = inject(AppCatalogService);
  private meta = inject(MetaService);

  apps$: Observable<ReadonlyArray<AppEntry> | null> = this.loadApps();
  loadError = false;

  ngOnInit(): void {
    this.meta.setForHome();
  }

  loadApps(): Observable<ReadonlyArray<AppEntry> | null> {
    return this.catalogService.list().pipe(catchError(() => {
      this.loadError = true;
      return of(null);
    }));
  }

  retry(): void {
    this.loadError = false;
    this.apps$ = this.loadApps();
  }

  trackApp(_index: number, app: AppEntry): string { return app.slug; }
}
