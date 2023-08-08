import { TestBed } from '@angular/core/testing';

import { UserActivityService } from './user-activity.service';

describe('UserActivityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserActivityService = TestBed.get(UserActivityService);
    expect(service).toBeTruthy();
  });
});
