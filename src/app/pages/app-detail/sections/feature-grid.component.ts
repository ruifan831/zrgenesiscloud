import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFeature } from '../../../models/app.model';
import { FeatureCardComponent } from './feature-card.component';

/** Surface alternation for feature tiles: light → dark → parchment → repeat */
const SURFACE_CYCLE = [
  'surface-light',
  'surface-tile-dark-1',
  'surface-parchment',
] as const;

@Component({
  selector: 'app-feature-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FeatureCardComponent],
  templateUrl: './feature-grid.component.html',
  styleUrl: './feature-grid.component.scss',
})
export class FeatureGridComponent {
  @Input() features: AppFeature[] = [];

  featureTiles(): Array<{
    feature: AppFeature;
    surface: string;
    dark: boolean;
    imageRight: boolean;
  }> {
    return this.features.map((feature, i) => {
      const surface = SURFACE_CYCLE[i % SURFACE_CYCLE.length];
      return {
        feature,
        surface,
        dark: surface === 'surface-tile-dark-1',
        imageRight: i % 2 === 1,
      };
    });
  }
}
