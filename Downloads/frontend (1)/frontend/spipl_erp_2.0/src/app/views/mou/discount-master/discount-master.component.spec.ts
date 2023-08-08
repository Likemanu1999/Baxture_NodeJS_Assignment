import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountMasterComponent } from './discount-master.component';

describe('DiscountMasterComponent', () => {
  let component: DiscountMasterComponent;
  let fixture: ComponentFixture<DiscountMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
