import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuanceReportComponent } from './issuance-report.component';

describe('IssuanceReportComponent', () => {
  let component: IssuanceReportComponent;
  let fixture: ComponentFixture<IssuanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
