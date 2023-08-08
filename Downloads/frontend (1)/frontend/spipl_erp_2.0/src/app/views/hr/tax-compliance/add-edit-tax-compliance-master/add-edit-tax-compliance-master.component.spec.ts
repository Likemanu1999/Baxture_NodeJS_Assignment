import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTaxComplianceMasterComponent } from './add-edit-tax-compliance-master.component';

describe('AddEditTaxComplianceMasterComponent', () => {
  let component: AddEditTaxComplianceMasterComponent;
  let fixture: ComponentFixture<AddEditTaxComplianceMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTaxComplianceMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTaxComplianceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
