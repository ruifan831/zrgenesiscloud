import { Component, OnInit } from '@angular/core';
import { MetaService } from '../../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-vision-cue-privacy',
  standalone: true,
  imports: [],
  templateUrl: './vision-cue-privacy.component.html',
  styleUrl: './vision-cue-privacy.component.scss',
})
export class VisionCuePrivacyComponent implements OnInit {
  constructor(private metaService: MetaService) {}

  ngOnInit(): void {
    this.metaService.setForLegal(
      '全能提词器隐私政策',
      '全能提词器应用的隐私政策，说明数据收集、使用方式及用户权利。',
    );
  }
}
