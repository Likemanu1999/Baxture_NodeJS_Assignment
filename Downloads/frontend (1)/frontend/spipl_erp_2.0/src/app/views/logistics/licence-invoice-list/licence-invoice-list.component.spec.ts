import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenceInvoiceListComponent } from './licence-invoice-list.component';

describe('LicenceInvoiceListComponent', () => {
  let component: LicenceInvoiceListComponent;
  let fixture: ComponentFixture<LicenceInvoiceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenceInvoiceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenceInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
