import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  ANDROID_DOWNLOAD_CHANNELS,
  APP_EARNING_STEPS,
  SHANYING_DOWNLOAD_NOTE
} from '../product-downloads';

@Component({
  selector: 'zrgenesiscloud-shanying',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzGridModule,
    NzCardModule,
    NzDividerModule,
    NzAvatarModule,
    NzCarouselModule,
    NzTagModule,
    NzIconModule
  ],
  templateUrl: './shanying.component.html',
  styleUrls: ['./shanying.component.scss']
})
export class ShanyingComponent implements OnInit {
  product = {
    id: 'shanying',
    title: '闪映',
    description: '闪映是一款信息展示类安卓应用，聚合展示授权图文与信息流内容，并结合广告推荐服务提供轻量浏览体验。用户可通过邀请机制拓展好友，符合规则的有效使用会进入收益记录。',
    image: 'assets/images/shanying.png',
    available: true
  };

  downloadChannels = ANDROID_DOWNLOAD_CHANNELS['shanying'];

  earningSteps = APP_EARNING_STEPS;

  directDownloadNote = SHANYING_DOWNLOAD_NOTE;

  features = [
    {
      title: '内容展示',
      description: '展示经过授权的图文及信息流内容，应用本身不采编、不储存、不播放内容',
      icon: 'read'
    },
    {
      title: '推荐服务',
      description: '结合第三方内容聚合与广告推荐服务，呈现更贴近用户兴趣的信息',
      icon: 'appstore'
    },
    {
      title: '邀请机制',
      description: '通过邀请链接或邀请码邀请新用户注册，系统会记录绑定关系',
      icon: 'user-add'
    },
    {
      title: '收益记录',
      description: '好友有效使用或完成激励广告任务后，收益按应用内规则累计',
      icon: 'wallet'
    },
    {
      title: '安卓分发',
      description: '已接入应用宝，后续可继续补充官网 APK 与主流安卓应用市场',
      icon: 'android'
    },
    {
      title: '合规透明',
      description: '提供应用权限与隐私说明，用户下载前可先查看相关信息',
      icon: 'safety-certificate'
    }
  ];

  screenshots = [
    'assets/images/shanying-screenshot-1.jpg',
    'assets/images/shanying-screenshot-2.jpg',
    'assets/images/shanying-screenshot-3.jpg',
    'assets/images/shanying-screenshot-4.jpg'
  ];

  constructor() { }

  ngOnInit(): void {}
}
