import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubOrgComponent } from './add-sub-org.component';

describe('AddSubOrgComponent', () => {
  let component: AddSubOrgComponent;
  let fixture: ComponentFixture<AddSubOrgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubOrgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
