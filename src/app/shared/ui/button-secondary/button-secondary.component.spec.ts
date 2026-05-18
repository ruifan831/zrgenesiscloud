import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonSecondaryComponent } from './button-secondary.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ButtonSecondaryComponent', () => {
  let component: ButtonSecondaryComponent;
  let fixture: ComponentFixture<ButtonSecondaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonSecondaryComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonSecondaryComponent);
    component = fixture.componentInstance;
    component.label = 'Secondary';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have class btn-secondary', () => {
    const btn = fixture.nativeElement.querySelector('.btn-secondary');
    expect(btn).toBeTruthy();
  });

  it('should emit clicked when clicked', () => {
    const spy = jasmine.createSpy('clickedSpy');
    component.clicked.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
