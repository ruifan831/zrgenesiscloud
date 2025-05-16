import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'zrgenesiscloud-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzGridModule,
    NzCardModule,
    NzDividerModule,
    NzTypographyModule,
    NzButtonModule,
    NzAvatarModule,
    NzIconModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  values = [
    {
      title: '创新',
      description: '不断探索新技术、新方法，提供创新的解决方案。',
      icon: 'bulb'
    },
    {
      title: '品质',
      description: '注重产品质量，精益求精，打造令用户满意的软件产品。',
      icon: 'trophy'
    },
    {
      title: '用户体验',
      description: '以用户为中心，提供简单易用、功能强大的应用体验。',
      icon: 'heart'
    },
    {
      title: '诚信',
      description: '诚实守信，尊重用户隐私，建立长期信任关系。',
      icon: 'safety'
    }
  ];
  
  team = [
    {
      name: '张伟',
      position: '创始人 & CEO',
      bio: '资深软件工程师，拥有十余年互联网产品开发经验，热衷于探索新技术。',
      image: 'assets/images/team-member1.jpg'
    },
    {
      name: '李静',
      position: '技术总监',
      bio: '全栈开发专家，负责公司产品的技术架构和开发管理，追求卓越代码质量。',
      image: 'assets/images/team-member2.jpg'
    },
    {
      name: '王强',
      position: '产品经理',
      bio: '深入了解用户需求，负责产品规划和设计，致力于打造卓越用户体验。',
      image: 'assets/images/team-member3.jpg'
    },
    {
      name: '赵思琪',
      position: '市场总监',
      bio: '营销专家，负责公司产品的推广和品牌建设，拥有丰富的市场运营经验。',
      image: 'assets/images/team-member4.jpg'
    }
  ];
}
