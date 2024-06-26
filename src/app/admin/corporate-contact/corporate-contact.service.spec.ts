import { TestBed } from "@angular/core/testing";
import { CorporateContactService } from "./corporate-contact.service";

describe("CorporateContactService", () => {
  let service: CorporateContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorporateContactService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
