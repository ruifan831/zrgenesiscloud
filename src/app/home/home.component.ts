import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AppCatalogService } from '../core/services/app-catalog.service';
import { MetaService } from '../shared/seo/meta.service';
import { AppEntry } from '../models/app.model';
import { HeroIntroComponent } from '../shared/ui/hero-intro/hero-intro.component';
import { ProductTileComponent } from '../shared/ui/product-tile/product-tile.component';

@Component({
  selector: 'zrgenesiscloud-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeroIntroComponent, ProductTileComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private catalogService = inject(AppCatalogService);
  private meta = inject(MetaService);

  apps$: Observable<ReadonlyArray<AppEntry>> = this.catalogService.list();
  loadError = false;

  ngOnInit(): void {
    this.meta.setForHome();
    this.apps$.subscribe({
      error: () => {
        this.loadError = true;
      },
    });
  }

  /**
   * Determines tile layout for each app by index.
   * Alternates image-right / image-left to match Apple gallery rhythm.
   * index 0 (calendar/dark): image-right
   * index 1 (vision-cue/light): image-left
   * index 2 (shanying/parchment): image-right
   */
  getTileLayout(index: number): 'image-right' | 'image-left' {
    return index % 2 === 0 ? 'image-right' : 'image-left';
  }
}
