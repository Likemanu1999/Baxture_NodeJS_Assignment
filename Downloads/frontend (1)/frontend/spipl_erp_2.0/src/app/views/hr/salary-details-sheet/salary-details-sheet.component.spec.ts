import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDetailsSheetComponent } from './salary-details-sheet.component';

describe('SalaryDetailsSheetComponent', () => {
  let component: SalaryDetailsSheetComponent;
  let fixture: ComponentFixture<SalaryDetailsSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalaryDetailsSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryDetailsSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
