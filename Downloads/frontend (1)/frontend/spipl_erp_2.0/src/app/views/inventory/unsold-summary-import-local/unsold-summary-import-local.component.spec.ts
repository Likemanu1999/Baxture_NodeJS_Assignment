import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsoldSummaryImportLocalComponent } from './unsold-summary-import-local.component';

describe('UnsoldSummaryImportLocalComponent', () => {
  let component: UnsoldSummaryImportLocalComponent;
  let fixture: ComponentFixture<UnsoldSummaryImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsoldSummaryImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsoldSummaryImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
