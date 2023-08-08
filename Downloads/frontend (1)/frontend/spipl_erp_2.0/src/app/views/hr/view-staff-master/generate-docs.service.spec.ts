import { TestBed } from '@angular/core/testing';

import { GenerateDocsService } from './generate-docs.service';

describe('GenerateDocsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenerateDocsService = TestBed.get(GenerateDocsService);
    expect(service).toBeTruthy();
  });
});
