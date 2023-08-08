import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearingExpensesReportComponent } from './clearing-expenses-report.component';

describe('ClearingExpensesReportComponent', () => {
  let component: ClearingExpensesReportComponent;
  let fixture: ComponentFixture<ClearingExpensesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClearingExpensesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearingExpensesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
