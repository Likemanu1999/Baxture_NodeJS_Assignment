import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightInwardRegisterReportComponent } from './freight-inward-register-report.component';

describe('FreightInwardRegisterReportComponent', () => {
  let component: FreightInwardRegisterReportComponent;
  let fixture: ComponentFixture<FreightInwardRegisterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreightInwardRegisterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightInwardRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
