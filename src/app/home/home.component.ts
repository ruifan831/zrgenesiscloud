import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../shared/animate-on-scroll.directive';

@Component({
  selector: 'zrgenesiscloud-home',
  standalone: true,
  imports: [
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzDividerModule,
    NzTypographyModule,
    CommonModule,
    AnimateOnScrollDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  heroBadges = ['移动端体验', '隐私至上', '持续更新'];

  // 当前页所列产品（含视觉 accent）
  products = [
    {
      icon: 'assets/images/calendar.png',
      title: '全民万年黄历通',
      desc: '集日历、黄历、节气、节日于一体的多功能日历应用，帮助您合理安排生活与工作。',
      href: '/products/calendar',
      tags: ['日历', '黄历', '节气'],
      accent: 'amber'
    },
    {
      icon: 'assets/images/teleprompter-app.jpg',
      title: '全能提词器',
      desc: '专业的提词器应用，适合主播、演讲者、视频创作者使用，让您的表达更加流畅自信。',
      href: '/products/vision-cue',
      tags: ['提词器', '直播', '创作'],
      accent: 'cool'
    },
    {
      icon: 'assets/images/shanying.png',
      title: '闪映',
      desc: '信息展示类安卓应用，聚合授权图文与信息流内容，并结合广告推荐服务展示内容。',
      href: '/products/shanying',
      tags: ['安卓', '信息流', '收益'],
      accent: 'rose'
    }
  ];

  features = [
    {
      icon: 'rocket',
      title: '高效便捷',
      description: '应用设计简洁，操作便捷，让您的使用体验更加流畅高效。'
    },
    {
      icon: 'safety',
      title: '安全可靠',
      description: '重视用户隐私和数据安全，采用先进的保护措施确保信息安全。'
    },
    {
      icon: 'tool',
      title: '功能强大',
      description: '基于真实需求设计功能，简单易用且强大，满足各种使用场景。'
    },
    {
      icon: 'customer-service',
      title: '贴心服务',
      description: '提供及时的客户支持，确保使用过程中每一个问题都能得到解决。'
    },
    {
      icon: 'sync',
      title: '持续更新',
      description: '不断收集用户反馈，持续改进产品，定期推出更新以优化体验。'
    },
    {
      icon: 'cloud',
      title: '云端同步',
      description: '支持多设备云端同步，让您的数据随时随地可用，不受设备限制。'
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
