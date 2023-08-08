import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarySheetNewComponent } from './salary-sheet-new.component';

describe('SalarySheetNewComponent', () => {
  let component: SalarySheetNewComponent;
  let fixture: ComponentFixture<SalarySheetNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarySheetNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarySheetNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
