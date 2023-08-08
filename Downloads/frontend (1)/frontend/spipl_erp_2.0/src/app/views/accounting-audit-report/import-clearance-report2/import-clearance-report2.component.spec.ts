import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportClearanceReport2Component } from './import-clearance-report2.component';

describe('ImportClearanceReport2Component', () => {
  let component: ImportClearanceReport2Component;
  let fixture: ComponentFixture<ImportClearanceReport2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportClearanceReport2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportClearanceReport2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
