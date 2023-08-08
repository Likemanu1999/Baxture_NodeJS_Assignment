import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementOperationsComponent } from './management-operations.component';

describe('ManagementOperationsComponent', () => {
  let component: ManagementOperationsComponent;
  let fixture: ComponentFixture<ManagementOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagementOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
