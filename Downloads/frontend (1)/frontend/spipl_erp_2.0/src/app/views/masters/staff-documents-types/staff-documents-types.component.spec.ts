import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDocumentsTypesComponent } from './staff-documents-types.component';

describe('StaffDocumentsTypesComponent', () => {
  let component: StaffDocumentsTypesComponent;
  let fixture: ComponentFixture<StaffDocumentsTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDocumentsTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffDocumentsTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
