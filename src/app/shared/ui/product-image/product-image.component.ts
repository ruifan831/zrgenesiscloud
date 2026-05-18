import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-product-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './product-image.component.html',
  styleUrl: './product-image.component.scss',
})
export class ProductImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() aspect?: number;   // width/height ratio, e.g. 0.56 for portrait phone
}
