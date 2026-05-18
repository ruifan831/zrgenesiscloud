import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFeature } from '../../../models/app.model';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.scss',
})
export class FeatureCardComponent {
  @Input() feature!: AppFeature;
  /** Controls text color for dark vs light tile */
  @Input() dark = false;
  /** Optional feature image path */
  @Input() imageSrc?: string;
  /** Left or right image layout */
  @Input() imageRight = false;
}
