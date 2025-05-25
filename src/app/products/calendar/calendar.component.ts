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
  selector: 'zrgenesiscloud-calendar',
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
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  product = {
    id: 'calendar',
    title: '万年历日历黄历天气节气',
    description: '万年历日历黄历天气节气是一款功能全面的日历应用，将传统万年历、黄历与现代日程管理完美结合。无论是查询日期、农历、节气，还是安排日程、设置提醒，都能轻松完成。',
    image: 'assets/images/calendar.png',
    available: true
  };
  
  features = [
    { 
      title: '万年历功能', 
      description: '查看公历、农历日期、节气、节日等信息，传统历法与现代日历完美结合' 
    },
    { 
      title: '黄历查询', 
      description: '每日宜忌提示，帮助您选择吉日，生活更加顺利' 
    },
    { 
      title: '日程管理', 
      description: '创建、管理日程，设置提醒，重要事项不再遗忘' 
    },
    { 
      title: '节日提醒', 
      description: '重要节日、纪念日自动提醒，亲友生日不再错过' 
    },
    { 
      title: '农历转换', 
      description: '公历与农历互转，方便查询传统节日和重要日期' 
    },
    { 
      title: '界面定制', 
      description: '提供多种主题和显示方式，个性化您的日历体验' 
    }
  ];
  
  // 特性图标（使用NG-ZORRO图标）
  featureIcons = [
    'calendar', 'compass', 'schedule', 'notification', 'sync', 'skin'
  ];
  
  screenshots = [
    'assets/images/calendar-screenshot-1.jpg',
    'assets/images/calendar-screenshot-2.jpg',
    'assets/images/calendar-screenshot-3.jpg',
    'assets/images/calendar-screenshot-4.jpg'
  ];
  
  reviews = [
    {
      author: '张先生',
      content: '这款万年历太好用了，查询农历和节气非常方便，界面也很漂亮。',
      rating: 5,
      date: '2023-10-15'
    },
    {
      author: '李女士',
      content: '日程管理功能很实用，提醒也很准时，帮我记住了很多重要事项。',
      rating: 5,
      date: '2023-09-28'
    },
    {
      author: '王先生',
      content: '黄历功能很全面，界面简洁直观，是一款很不错的万年历应用。',
      rating: 4,
      date: '2023-09-05'
    }
  ];
  
  constructor() { }
  
  ngOnInit(): void {
    // 初始化代码
  }
}
