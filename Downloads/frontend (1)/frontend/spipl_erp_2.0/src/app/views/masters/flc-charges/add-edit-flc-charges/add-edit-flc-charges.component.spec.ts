import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFlcChargesComponent } from './add-edit-flc-charges.component';

describe('AddEditFlcChargesComponent', () => {
  let component: AddEditFlcChargesComponent;
  let fixture: ComponentFixture<AddEditFlcChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditFlcChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditFlcChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
