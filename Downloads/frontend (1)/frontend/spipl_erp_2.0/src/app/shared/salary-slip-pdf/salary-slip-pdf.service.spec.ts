import { TestBed } from '@angular/core/testing';

import { SalarySlipPdfService } from './salary-slip-pdf.service';

describe('SalarySlipPdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SalarySlipPdfService = TestBed.get(SalarySlipPdfService);
    expect(service).toBeTruthy();
  });
});
