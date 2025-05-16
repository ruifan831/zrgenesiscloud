import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'zrgenesiscloud-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzDrawerModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent{
  isCollapsed = true;
  isScrolled = false;
  
  // 用于存储当前选中的菜单项
  
  constructor(private router: Router) {}
  
  
  // 监听滚动事件，用于头部透明度变化
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 30;
  }
  
  // 打开移动端菜单
  openMenu(): void {
    this.isCollapsed = false;
  }
  
  // 关闭移动端菜单
  closeMenu(): void {
    this.isCollapsed = true;
  }
}