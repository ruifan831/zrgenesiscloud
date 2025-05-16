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
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'zrgenesiscloud-vision-cue',
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
    NzCommentModule,
    NzRateModule,
    NzTagModule,
    NzIconModule
  ],
  templateUrl: './vision-cue.component.html',
  styleUrls: ['./vision-cue.component.scss']
})
export class VisionCueComponent implements OnInit {
  product = {
    id: 'teleprompter',
    title: '全能提词器',
    description: '专业的提词器应用，适合主播、演讲者、视频创作者使用，让您的表达更加流畅自信。支持多种格式导入文本，速度自由调节，字体设置灵活，镜像模式适配各种设备，是您演讲、直播、录制视频的得力助手。',
    image: 'assets/images/teleprompter-app.jpg',
    available: true
  };
  
  features = [
    {
      title: '文本导入',
      description: '支持TXT、DOC、PDF等多种格式文本导入，也可直接复制粘贴或手动输入',
      icon: 'file-text'
    },
    {
      title: '速度调节',
      description: '滚动速度自由调整，支持手势控制和自动滚动，适应不同场景需求',
      icon: 'dashboard'
    },
    {
      title: '字体设置',
      description: '字体大小、颜色、样式灵活设置，满足不同使用环境和个人偏好',
      icon: 'font-size'
    },
    {
      title: '镜像模式',
      description: '支持水平和垂直镜像，适配各种提词设备和使用场景',
      icon: 'swap'
    },
    {
      title: '远程控制',
      description: '支持蓝牙遥控器和手机远程控制，方便演讲者操作',
      icon: 'control'
    },
    {
      title: '云同步',
      description: '支持云端存储和同步，多设备无缝切换，永不丢失内容',
      icon: 'cloud-sync'
    }
  ];
  
  screenshots = [
    'assets/images/teleprompter-screenshot-1.jpg',
    'assets/images/teleprompter-screenshot-2.jpg',
    'assets/images/teleprompter-screenshot-3.jpg',
    'assets/images/teleprompter-screenshot-4.jpg'
  ];
  
  useCases = [
    {
      title: '演讲与演示',
      description: '帮助演讲者在会议、演讲和演示中流畅地表达，保持自然的眼神交流',
      icon: 'sound'
    },
    {
      title: '视频创作',
      description: '为YouTuber、Vlogger等内容创作者提供稿件提示，提高拍摄效率',
      icon: 'video-camera'
    },
    {
      title: '直播主播',
      description: '助力直播主播流畅介绍产品、回答问题，提升直播质量',
      icon: 'customer-service'
    },
    {
      title: '教育培训',
      description: '帮助教师和培训师更有条理地进行课程讲解，不遗漏重点',
      icon: 'book'
    },
    {
      title: '新闻播报',
      description: '为新闻播报员和主持人提供专业的提词支持',
      icon: 'read'
    },
    {
      title: '企业宣传',
      description: '在企业宣传片、产品介绍视频录制中提供脚本支持',
      icon: 'solution'
    }
  ];
  
  reviews = [
    {
      author: '张先生',
      content: '非常专业的提词器应用，我在录制教程视频时用它很方便，界面简洁，功能强大。',
      rating: 5,
      date: '2023-10-12'
    },
    {
      author: '王女士',
      content: '作为一名主播，这款提词器帮了我大忙，远程控制功能特别实用，强烈推荐！',
      rating: 5,
      date: '2023-09-25'
    },
    {
      author: '李先生',
      content: '界面设计很人性化，功能也很丰富，比其他同类应用好用多了，值得购买。',
      rating: 4,
      date: '2023-09-08'
    }
  ];
  
  constructor() { }
  
  ngOnInit(): void {
    // 初始化逻辑
  }
}
