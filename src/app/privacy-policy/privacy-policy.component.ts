import { Component, OnInit } from '@angular/core';
import { MetaService } from '../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(private metaService: MetaService) {}

  ngOnInit(): void {
    this.metaService.setForLegal(
      '隐私政策',
      'ZRGenesis 全站隐私政策，说明数据收集与用户权利。',
    );
  }
}
