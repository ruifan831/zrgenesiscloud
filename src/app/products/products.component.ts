import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'zrgenesiscloud-products',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NzPageHeaderModule,
    NzCardModule,
    NzGridModule,
    NzListModule,
    NzTagModule,
    NzButtonModule,
    NzDividerModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzIconModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  products = [
    {
      id: 'calendar',
      title: '万年历黄历通',
      description: '集日历、黄历、节气、节日于一体的多功能日历应用，帮助您合理安排生活与工作。',
      features: [
        '日历功能：查看日期、农历、节气、节日等信息',
        '黄历功能：宜忌提示、吉日查询',
        '提醒功能：重要日期提醒、生日提醒',
        '节假日显示：国家法定节假日一目了然'
      ],
      image: 'assets/images/calendar.png',
      available: true
    },
    {
      id: 'vision-cue',
      title: '全能提词器',
      description: '专业的提词器应用，适合主播、演讲者、视频创作者使用，让您的表达更加流畅自信。',
      features: [
        '文本导入：支持多种格式导入文本',
        '速度调节：滚动速度自由调整',
        '字体设置：大小、颜色、样式灵活设置',
        '镜像模式：适配各种提词设备'
      ],
      image: 'assets/images/teleprompter-app.jpg',
      available: true
    }
  ];
}
