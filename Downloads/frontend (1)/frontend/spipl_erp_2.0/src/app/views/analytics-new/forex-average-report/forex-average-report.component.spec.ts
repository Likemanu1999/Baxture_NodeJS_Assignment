import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexAverageReportComponent } from './forex-average-report.component';

describe('ForexAverageReportComponent', () => {
  let component: ForexAverageReportComponent;
  let fixture: ComponentFixture<ForexAverageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForexAverageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForexAverageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
