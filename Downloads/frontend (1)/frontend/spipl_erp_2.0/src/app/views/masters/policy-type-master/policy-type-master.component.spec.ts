import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTypeMasterComponent } from './policy-type-master.component';

describe('PolicyTypeMasterComponent', () => {
  let component: PolicyTypeMasterComponent;
  let fixture: ComponentFixture<PolicyTypeMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyTypeMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
