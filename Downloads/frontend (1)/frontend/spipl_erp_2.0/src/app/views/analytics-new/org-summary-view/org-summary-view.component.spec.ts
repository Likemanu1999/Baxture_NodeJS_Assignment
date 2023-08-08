import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSummaryViewComponent } from './org-summary-view.component';

describe('OrgSummaryViewComponent', () => {
  let component: OrgSummaryViewComponent;
  let fixture: ComponentFixture<OrgSummaryViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgSummaryViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSummaryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
