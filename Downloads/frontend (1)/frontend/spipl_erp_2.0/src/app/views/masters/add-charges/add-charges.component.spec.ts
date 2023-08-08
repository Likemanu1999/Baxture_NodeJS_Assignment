import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargesComponent } from './add-charges.component';

describe('AddChargesComponent', () => {
  let component: AddChargesComponent;
  let fixture: ComponentFixture<AddChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
