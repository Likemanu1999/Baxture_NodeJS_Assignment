import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceProtectionComponent } from './price-protection.component';

describe('PriceProtectionComponent', () => {
  let component: PriceProtectionComponent;
  let fixture: ComponentFixture<PriceProtectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceProtectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceProtectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
