import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonlcRemittanceChargesComponent } from './nonlc-remittance-charges.component';

describe('NonlcRemittanceChargesComponent', () => {
  let component: NonlcRemittanceChargesComponent;
  let fixture: ComponentFixture<NonlcRemittanceChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonlcRemittanceChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonlcRemittanceChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
