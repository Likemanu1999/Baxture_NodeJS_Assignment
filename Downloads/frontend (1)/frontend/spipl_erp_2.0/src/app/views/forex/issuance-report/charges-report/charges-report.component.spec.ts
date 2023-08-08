import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesReportComponent } from './charges-report.component';

describe('ChargesReportComponent', () => {
  let component: ChargesReportComponent;
  let fixture: ComponentFixture<ChargesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
