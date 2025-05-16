import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionCueComponent } from './vision-cue.component';

describe('VisionCueComponent', () => {
  let component: VisionCueComponent;
  let fixture: ComponentFixture<VisionCueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisionCueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisionCueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
