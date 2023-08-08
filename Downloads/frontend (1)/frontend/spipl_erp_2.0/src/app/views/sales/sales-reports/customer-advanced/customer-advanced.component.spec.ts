import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAdvancedComponent } from './customer-advanced.component';

describe('CustomerAdvancedComponent', () => {
  let component: CustomerAdvancedComponent;
  let fixture: ComponentFixture<CustomerAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAdvancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
