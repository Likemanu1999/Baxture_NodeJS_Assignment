import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTaxComplianceDetailsComponent } from './add-edit-tax-compliance-details.component';

describe('AddEditTaxComplianceDetailsComponent', () => {
  let component: AddEditTaxComplianceDetailsComponent;
  let fixture: ComponentFixture<AddEditTaxComplianceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTaxComplianceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTaxComplianceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
