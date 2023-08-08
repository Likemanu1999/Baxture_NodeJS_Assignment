import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCrossReportComponent } from './load-cross-report.component';

describe('LoadCrossReportComponent', () => {
  let component: LoadCrossReportComponent;
  let fixture: ComponentFixture<LoadCrossReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCrossReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCrossReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
