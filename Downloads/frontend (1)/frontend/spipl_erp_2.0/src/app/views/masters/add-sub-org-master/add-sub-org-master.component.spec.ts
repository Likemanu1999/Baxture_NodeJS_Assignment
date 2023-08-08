import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubOrgMasterComponent } from './add-sub-org-master.component';

describe('AddSubOrgMasterComponent', () => {
  let component: AddSubOrgMasterComponent;
  let fixture: ComponentFixture<AddSubOrgMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubOrgMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubOrgMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
