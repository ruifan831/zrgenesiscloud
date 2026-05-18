import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-legal-links',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-links.component.html',
  styleUrl: './legal-links.component.scss',
})
export class LegalLinksComponent {
  @Input() appName = '';
  @Input() privacyUrl?: string;
  @Input() termsUrl?: string;
}
