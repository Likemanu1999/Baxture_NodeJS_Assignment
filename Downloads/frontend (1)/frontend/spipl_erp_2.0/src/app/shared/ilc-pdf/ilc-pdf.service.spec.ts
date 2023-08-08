import { TestBed } from '@angular/core/testing';

import { IlcPdfService } from './ilc-pdf.service';

describe('IlcPdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IlcPdfService = TestBed.get(IlcPdfService);
    expect(service).toBeTruthy();
  });
});
