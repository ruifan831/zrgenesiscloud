import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarPrivacyComponent } from './calendar-privacy.component';

describe('CalendarPrivacyComponent', () => {
  let component: CalendarPrivacyComponent;
  let fixture: ComponentFixture<CalendarPrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPrivacyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render privacy title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('全民万年黄历通');
  });
});
