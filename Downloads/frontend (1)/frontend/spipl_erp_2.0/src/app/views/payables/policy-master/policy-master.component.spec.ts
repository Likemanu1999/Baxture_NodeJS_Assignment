import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMasterComponent } from './policy-master.component';

describe('PolicyMasterComponent', () => {
  let component: PolicyMasterComponent;
  let fixture: ComponentFixture<PolicyMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
