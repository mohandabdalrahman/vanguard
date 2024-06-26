import { TestBed } from "@angular/core/testing";
import { MasterMerchantService } from "./master-merchant.service";

describe("MasterMerchantService", () => {
  let service: MasterMerchantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterMerchantService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
