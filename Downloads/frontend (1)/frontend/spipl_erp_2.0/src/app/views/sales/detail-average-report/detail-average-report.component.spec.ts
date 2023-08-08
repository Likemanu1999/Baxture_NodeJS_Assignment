import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAverageReportComponent } from './detail-average-report.component';

describe('DetailAverageReportComponent', () => {
  let component: DetailAverageReportComponent;
  let fixture: ComponentFixture<DetailAverageReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailAverageReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAverageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
