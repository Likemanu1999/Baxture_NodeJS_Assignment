import { TestBed } from '@angular/core/testing';

import { WhatsappService } from './whatsapp.service';

describe('WhatsappService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WhatsappService = TestBed.get(WhatsappService);
    expect(service).toBeTruthy();
  });
});
