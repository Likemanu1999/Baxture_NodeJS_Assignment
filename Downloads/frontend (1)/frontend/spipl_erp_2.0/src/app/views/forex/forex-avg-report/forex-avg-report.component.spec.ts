import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexAvgReportComponent } from './forex-avg-report.component';

describe('ForexAvgReportComponent', () => {
  let component: ForexAvgReportComponent;
  let fixture: ComponentFixture<ForexAvgReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForexAvgReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForexAvgReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
