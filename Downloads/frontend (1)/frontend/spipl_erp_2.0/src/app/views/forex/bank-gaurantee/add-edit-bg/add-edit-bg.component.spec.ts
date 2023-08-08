import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBgComponent } from './add-edit-bg.component';

describe('AddEditBgComponent', () => {
  let component: AddEditBgComponent;
  let fixture: ComponentFixture<AddEditBgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditBgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
