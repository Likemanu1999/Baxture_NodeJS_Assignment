import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchBillingComponent } from './dispatch-billing.component';

describe('DispatchBillingComponent', () => {
  let component: DispatchBillingComponent;
  let fixture: ComponentFixture<DispatchBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
