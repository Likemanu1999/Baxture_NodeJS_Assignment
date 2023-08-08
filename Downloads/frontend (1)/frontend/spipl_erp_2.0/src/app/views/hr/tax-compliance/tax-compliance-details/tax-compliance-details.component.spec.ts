import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxComplianceDetailsComponent } from './tax-compliance-details.component';

describe('TaxComplianceDetailsComponent', () => {
  let component: TaxComplianceDetailsComponent;
  let fixture: ComponentFixture<TaxComplianceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxComplianceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxComplianceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
