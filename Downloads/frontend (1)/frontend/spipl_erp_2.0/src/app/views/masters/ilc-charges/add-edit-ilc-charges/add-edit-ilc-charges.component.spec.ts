import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditIlcChargesComponent } from './add-edit-ilc-charges.component';

describe('AddEditIlcChargesComponent', () => {
  let component: AddEditIlcChargesComponent;
  let fixture: ComponentFixture<AddEditIlcChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditIlcChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditIlcChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
