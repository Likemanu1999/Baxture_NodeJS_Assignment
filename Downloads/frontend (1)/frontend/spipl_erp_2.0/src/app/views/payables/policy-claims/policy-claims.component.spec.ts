import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyClaimsComponent } from './policy-claims.component';

describe('PolicyClaimsComponent', () => {
  let component: PolicyClaimsComponent;
  let fixture: ComponentFixture<PolicyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
