import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryChallanPdfComponent } from './delivery-challan-pdf.component';

describe('DeliveryChallanPdfComponent', () => {
  let component: DeliveryChallanPdfComponent;
  let fixture: ComponentFixture<DeliveryChallanPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryChallanPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryChallanPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
