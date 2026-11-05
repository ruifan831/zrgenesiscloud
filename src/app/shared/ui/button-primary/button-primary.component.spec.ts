import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonPrimaryComponent } from './button-primary.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ButtonPrimaryComponent', () => {
  let component: ButtonPrimaryComponent;
  let fixture: ComponentFixture<ButtonPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonPrimaryComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonPrimaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a button element when no href or routerLink', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
  });

  it('should have class btn-primary', () => {
    const btn = fixture.nativeElement.querySelector('.btn-primary');
    expect(btn).toBeTruthy();
  });

  it('should render lg size class when size=lg', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-primary--lg');
    expect(btn).toBeTruthy();
  });

  it('should emit clicked event on button click', () => {
    const spy = jasmine.createSpy('clickedSpy');
    component.clicked.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = jasmine.createSpy('clickedSpy');
    component.clicked.subscribe(spy);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
    button.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render an anchor when href is provided', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a.btn-primary');
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe('https://example.com');
  });
});
