import { TestBed } from '@angular/core/testing';

import { ThemeSwitchingService } from './theme-switching.service';

describe('ThemeSwitchingService', () => {
  let service: ThemeSwitchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeSwitchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
