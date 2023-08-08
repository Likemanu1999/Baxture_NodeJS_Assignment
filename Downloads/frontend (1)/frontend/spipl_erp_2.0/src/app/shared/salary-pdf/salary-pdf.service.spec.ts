import { TestBed } from '@angular/core/testing';

import { SalaryPdfService } from './salary-pdf.service';

describe('SalaryPdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SalaryPdfService = TestBed.get(SalaryPdfService);
    expect(service).toBeTruthy();
  });
});
