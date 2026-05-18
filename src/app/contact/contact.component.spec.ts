import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose contactEmail', () => {
    expect(component.contactEmail).toBeTruthy();
  });

  it('should render mailto link', () => {
    const emailLink = fixture.nativeElement.querySelector('a.contact-page__email-link');
    expect(emailLink?.href).toContain('mailto:');
  });
});
