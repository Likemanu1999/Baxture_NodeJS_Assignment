import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCurrencyConvertComponent } from './add-edit-currency-convert.component';

describe('AddEditCurrencyConvertComponent', () => {
  let component: AddEditCurrencyConvertComponent;
  let fixture: ComponentFixture<AddEditCurrencyConvertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditCurrencyConvertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCurrencyConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
