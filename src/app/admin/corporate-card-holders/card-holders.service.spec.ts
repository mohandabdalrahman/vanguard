import { TestBed } from '@angular/core/testing';

import { CardHoldersService } from './card-holders.service';

describe('CardHoldersService', () => {
  let service: CardHoldersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardHoldersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
