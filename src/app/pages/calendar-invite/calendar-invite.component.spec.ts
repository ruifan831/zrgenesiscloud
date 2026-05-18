import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CalendarInviteComponent } from './calendar-invite.component';

describe('CalendarInviteComponent', () => {
  let component: CalendarInviteComponent;
  let fixture: ComponentFixture<CalendarInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarInviteComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render invite form', () => {
    const form = fixture.nativeElement.querySelector('form.invite-page__form');
    expect(form).toBeTruthy();
  });

  it('should render submit button', () => {
    const btn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn).toBeTruthy();
  });
});
