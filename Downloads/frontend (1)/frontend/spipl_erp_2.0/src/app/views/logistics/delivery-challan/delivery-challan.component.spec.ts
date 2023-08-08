import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryChallanComponent } from './delivery-challan.component';

describe('DeliveryChallanComponent', () => {
  let component: DeliveryChallanComponent;
  let fixture: ComponentFixture<DeliveryChallanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryChallanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
