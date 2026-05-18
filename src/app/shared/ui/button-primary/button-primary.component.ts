import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-button-primary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './button-primary.component.html',
  styleUrl: './button-primary.component.scss',
})
export class ButtonPrimaryComponent {
  @Input() label = '';
  @Input() href?: string;
  @Input() routerLink?: string | string[];
  @Input() size: 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() external = false;

  @Output() clicked = new EventEmitter<void>();

  get isAnchor(): boolean {
    return !!(this.href || this.routerLink);
  }

  onButtonClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
