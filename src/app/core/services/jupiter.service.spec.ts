import { TestBed } from '@angular/core/testing';

import { JupiterService } from './jupiter.service';

describe('JupiterService', () => {
  let service: JupiterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JupiterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
