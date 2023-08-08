import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubOrgUpdateComponent } from './sub-org-update.component';

describe('SubOrgUpdateComponent', () => {
  let component: SubOrgUpdateComponent;
  let fixture: ComponentFixture<SubOrgUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubOrgUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubOrgUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
