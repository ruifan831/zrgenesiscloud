import { Component, OnInit } from '@angular/core';
import { MetaService } from '../../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-calendar-privacy',
  standalone: true,
  imports: [],
  templateUrl: './calendar-privacy.component.html',
  styleUrl: './calendar-privacy.component.scss',
})
export class CalendarPrivacyComponent implements OnInit {
  constructor(private metaService: MetaService) {}

  ngOnInit(): void {
    this.metaService.setForLegal(
      '全民万年黄历通隐私政策',
      '全民万年黄历通应用的隐私政策，说明数据收集、使用方式及用户权利。',
    );
  }
}
