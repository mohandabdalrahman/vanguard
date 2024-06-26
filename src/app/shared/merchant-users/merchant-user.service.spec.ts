import { TestBed } from "@angular/core/testing";
import { MerchantUserService } from "./merchant-user.service";

describe("MerchantUserService", () => {
  let service: MerchantUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchantUserService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
