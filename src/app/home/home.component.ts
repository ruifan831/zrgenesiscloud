import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { CommonModule } from '@angular/common';

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
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // 定义 features 数组
  features = [
    {
      icon: 'rocket',
      title: '高效便捷',
      description: '我们的应用设计简洁，操作便捷，让您的使用体验更加流畅高效。'
    },
    {
      icon: 'safety',
      title: '安全可靠',
      description: '我们重视用户隐私和数据安全，采用先进的保护措施确保您的信息安全。'
    },
    {
      icon: 'tool',
      title: '功能强大',
      description: '根据用户实际需求设计功能，简单易用且功能强大，满足各种使用场景。'
    },
    {
      icon: 'customer-service',
      title: '贴心服务',
      description: '提供及时的客户支持和服务，确保您使用过程中的每一个问题都能得到解决。'
    },
    {
      icon: 'sync',
      title: '持续更新',
      description: '我们不断收集用户反馈，持续改进产品，定期推出更新以优化用户体验。'
    },
    {
      icon: 'cloud',
      title: '云端同步',
      description: '支持多设备云端同步，让您的数据随时随地可用，不受设备限制。'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}