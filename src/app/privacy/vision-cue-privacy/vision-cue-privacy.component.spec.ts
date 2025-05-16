import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionCuePrivacyComponent } from './vision-cue-privacy.component';

describe('VisionCuePrivacyComponent', () => {
  let component: VisionCuePrivacyComponent;
  let fixture: ComponentFixture<VisionCuePrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisionCuePrivacyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisionCuePrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
