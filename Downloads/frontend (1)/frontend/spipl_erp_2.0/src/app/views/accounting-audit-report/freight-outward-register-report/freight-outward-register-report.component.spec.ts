import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightOutwardRegisterReportComponent } from './freight-outward-register-report.component';

describe('FreightOutwardRegisterReportComponent', () => {
  let component: FreightOutwardRegisterReportComponent;
  let fixture: ComponentFixture<FreightOutwardRegisterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightOutwardRegisterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightOutwardRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
