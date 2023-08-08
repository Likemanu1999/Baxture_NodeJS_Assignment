import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcDiscountComponent } from './ilc-discount.component';

describe('IlcDiscountComponent', () => {
  let component: IlcDiscountComponent;
  let fixture: ComponentFixture<IlcDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
