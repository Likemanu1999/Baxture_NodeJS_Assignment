import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountReportComponent } from './discount-report.component';

describe('DiscountReportComponent', () => {
  let component: DiscountReportComponent;
  let fixture: ComponentFixture<DiscountReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
