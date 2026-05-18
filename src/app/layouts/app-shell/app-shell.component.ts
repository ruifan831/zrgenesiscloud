import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GlobalNavComponent } from '../../shared/ui/global-nav/global-nav.component';
import { SiteFooterComponent } from '../../shared/ui/site-footer/site-footer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, GlobalNavComponent, SiteFooterComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  showHeader = signal(true);
  showFooter = signal(true);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.router.routerState.root.firstChild;
        const data = route?.snapshot?.data ?? {};
        this.showHeader.set(data['showHeader'] !== false);
        this.showFooter.set(data['showFooter'] !== false);
      });
  }
}
