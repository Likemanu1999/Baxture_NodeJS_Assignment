import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfStaffComponent } from './list-of-staff.component';

describe('ListOfStaffComponent', () => {
  let component: ListOfStaffComponent;
  let fixture: ComponentFixture<ListOfStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListOfStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOfStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
