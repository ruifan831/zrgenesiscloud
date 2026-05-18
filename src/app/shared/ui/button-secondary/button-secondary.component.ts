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
  selector: 'ui-button-secondary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './button-secondary.component.html',
  styleUrl: './button-secondary.component.scss',
})
export class ButtonSecondaryComponent {
  @Input() label = '';
  @Input() href?: string;
  @Input() routerLink?: string | string[];
  @Input() size: 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() external = false;

  @Output() clicked = new EventEmitter<void>();

  onButtonClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
