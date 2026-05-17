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
import { ANDROID_DOWNLOAD_CHANNELS, DownloadChannel } from './product-downloads';

interface ProductListItem {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  available: boolean;
  downloadChannels: DownloadChannel[];
  earningSummary?: string;
}

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
  products: ProductListItem[] = [
    {
      id: 'calendar',
      title: '全民万年黄历通',
      description: '集日历、黄历、节气、节日于一体的安卓日历应用，帮助您合理安排生活与工作。',
      features: [
        '日历功能：查看日期、农历、节气、节日等信息',
        '黄历功能：宜忌提示、吉日查询',
        '邀请机制：分享邀请码绑定好友关系',
        '收益规则：有效使用与广告任务按规则记录收益'
      ],
      image: 'assets/images/calendar.png',
      available: true,
      downloadChannels: ANDROID_DOWNLOAD_CHANNELS['calendar'],
      earningSummary: '支持邀请好友注册，好友有效使用后按应用内规则累计收益。'
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
      available: true,
      downloadChannels: []
    },
    {
      id: 'shanying',
      title: '闪映',
      description: '信息展示类安卓应用，展示授权图文与信息流内容，并结合广告推荐服务提供轻量浏览体验。',
      features: [
        '内容展示：聚合授权图文与信息流内容',
        '广告推荐：结合第三方广告推荐服务展示内容',
        '邀请机制：邀请码邀请新用户注册',
        '收益规则：有效使用后按规则记录收益'
      ],
      image: 'assets/images/shanying.png',
      available: true,
      downloadChannels: ANDROID_DOWNLOAD_CHANNELS['shanying'],
      earningSummary: '用户可通过邀请机制扩展好友，符合规则的有效使用会进入收益记录。'
    }
  ];
}
