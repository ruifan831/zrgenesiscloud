import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-reward-callout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="reward-callout" aria-label="应用福利介绍">
      <img src="assets/images/rewards/reward-envelope.svg" alt="" width="520" height="380" />
      <div class="reward-callout__copy">
        <span class="reward-callout__label">应用里的小惊喜</span>
        <h2>好用，也有好福利</h2>
        <p>在支持活动的 App 中查看福利。<br />每日可参与抽奖，按固定周期开奖。</p>
      </div>
      <ul aria-label="福利类型"><li>广告奖励</li><li>幸运抽奖</li><li>邀请有礼</li></ul>
    </section>
  `,
  styleUrl: './reward-callout.component.scss',
})
export class RewardCalloutComponent {}
