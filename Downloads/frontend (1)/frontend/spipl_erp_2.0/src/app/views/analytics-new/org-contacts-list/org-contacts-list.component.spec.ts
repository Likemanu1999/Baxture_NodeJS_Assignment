import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgContactsListComponent } from './org-contacts-list.component';

describe('OrgContactsListComponent', () => {
  let component: OrgContactsListComponent;
  let fixture: ComponentFixture<OrgContactsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgContactsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgContactsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
