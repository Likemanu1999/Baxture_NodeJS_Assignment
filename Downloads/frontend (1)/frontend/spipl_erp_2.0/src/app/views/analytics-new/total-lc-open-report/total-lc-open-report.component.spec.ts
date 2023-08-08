import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalLcOpenReportComponent } from './total-lc-open-report.component';

describe('TotalLcOpenReportComponent', () => {
  let component: TotalLcOpenReportComponent;
  let fixture: ComponentFixture<TotalLcOpenReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalLcOpenReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalLcOpenReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
