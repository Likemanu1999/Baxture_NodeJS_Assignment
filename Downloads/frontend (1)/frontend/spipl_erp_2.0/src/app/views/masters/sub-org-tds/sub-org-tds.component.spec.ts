import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubOrgTdsComponent } from './sub-org-tds.component';

describe('SubOrgTdsComponent', () => {
  let component: SubOrgTdsComponent;
  let fixture: ComponentFixture<SubOrgTdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubOrgTdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubOrgTdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
