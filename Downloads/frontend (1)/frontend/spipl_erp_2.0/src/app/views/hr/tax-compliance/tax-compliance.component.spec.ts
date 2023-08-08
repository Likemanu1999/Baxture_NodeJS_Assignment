import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxComplianceComponent } from './tax-compliance.component';

describe('TaxComplianceComponent', () => {
  let component: TaxComplianceComponent;
  let fixture: ComponentFixture<TaxComplianceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxComplianceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
