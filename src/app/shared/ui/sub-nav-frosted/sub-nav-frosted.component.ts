import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface SubNavLink {
  label: string;
  fragment: string;
}

export interface SubNavCta {
  label: string;
  href: string;
}

@Component({
  selector: 'ui-sub-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './sub-nav-frosted.component.html',
  styleUrl: './sub-nav-frosted.component.scss',
})
export class SubNavFrostedComponent {
  @Input() appName = '';
  @Input() links: SubNavLink[] = [];
  @Input() cta?: SubNavCta;
}
