import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'zrgenesiscloud-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'zrgenesiscloud';
  showHeader = true;
  showFooter = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // 获取当前路由的配置
        const route = this.router.routerState.root.firstChild;
        if (route) {
          const routeData = route.snapshot.data;
          this.showHeader = routeData['showHeader'] !== false;
          this.showFooter = routeData['showFooter'] !== false;
        }
      });
  }
}