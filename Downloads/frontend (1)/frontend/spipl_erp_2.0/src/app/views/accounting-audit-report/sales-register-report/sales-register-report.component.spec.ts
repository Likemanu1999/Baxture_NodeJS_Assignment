import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRegisterReportComponent } from './sales-register-report.component';

describe('SalesRegisterReportComponent', () => {
  let component: SalesRegisterReportComponent;
  let fixture: ComponentFixture<SalesRegisterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesRegisterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
