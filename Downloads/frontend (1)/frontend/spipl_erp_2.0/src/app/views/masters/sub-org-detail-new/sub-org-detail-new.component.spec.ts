import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubOrgDetailNewComponent } from './sub-org-detail-new.component';

describe('SubOrgDetailNewComponent', () => {
  let component: SubOrgDetailNewComponent;
  let fixture: ComponentFixture<SubOrgDetailNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubOrgDetailNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubOrgDetailNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
