import { TestBed } from '@angular/core/testing';

import { PiPdfService } from './pi-pdf.service';

describe('PiPdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PiPdfService = TestBed.get(PiPdfService);
    expect(service).toBeTruthy();
  });
});
