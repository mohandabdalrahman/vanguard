import { TestBed } from '@angular/core/testing';

import { MerchantBillingAccountService } from './merchant-billing-account.service';

describe('MerchantBillingAccountService', () => {
  let service: MerchantBillingAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchantBillingAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
