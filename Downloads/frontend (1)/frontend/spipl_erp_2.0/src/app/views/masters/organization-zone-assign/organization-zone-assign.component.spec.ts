import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationZoneAssignComponent } from './organization-zone-assign.component';

describe('OrganizationZoneAssignComponent', () => {
  let component: OrganizationZoneAssignComponent;
  let fixture: ComponentFixture<OrganizationZoneAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationZoneAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationZoneAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
