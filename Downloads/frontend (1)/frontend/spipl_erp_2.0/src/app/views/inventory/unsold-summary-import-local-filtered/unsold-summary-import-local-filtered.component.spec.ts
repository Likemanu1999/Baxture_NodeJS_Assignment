import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsoldSummaryImportLocalFilteredComponent } from './unsold-summary-import-local-filtered.component';

describe('UnsoldSummaryImportLocalFilteredComponent', () => {
  let component: UnsoldSummaryImportLocalFilteredComponent;
  let fixture: ComponentFixture<UnsoldSummaryImportLocalFilteredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsoldSummaryImportLocalFilteredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsoldSummaryImportLocalFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
