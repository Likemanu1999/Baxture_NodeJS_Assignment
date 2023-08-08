import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBankOtherChargesComponent } from './add-edit-bank-other-charges.component';

describe('AddEditBankOtherChargesComponent', () => {
  let component: AddEditBankOtherChargesComponent;
  let fixture: ComponentFixture<AddEditBankOtherChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditBankOtherChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditBankOtherChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
