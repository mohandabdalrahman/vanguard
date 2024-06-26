import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Country } from "./country.model";
import { CountryService } from "./country.service";

describe("CountryService", () => {
  let service: CountryService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CountryService],
    });
    service = TestBed.inject(CountryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe("getCountries", () => {
    it("should call with correct url", () => {
      service.getCountries().subscribe();
      const req = httpTestingController.expectOne(
        "http://ec2-15-185-203-230.me-south-1.compute.amazonaws.com:8080/lookup-service/country"
      );
      // what data should be returned
      req.flush([
        { id: 1, enName: "United States", localeName: "United States" },
      ]);
      expect(req.request.method).toBe("GET");
      // one request fire
      httpTestingController.verify();
    });
  });

  describe("getCountry", () => {
    fit("should call with correct url", () => {
      service.getCountry(1).subscribe((country) => {
        expect(country.id).toBe(1);
      });
      const req = httpTestingController.expectOne(
        "http://ec2-15-185-203-230.me-south-1.compute.amazonaws.com:8080/lookup-service/country/1"
      );
      // what data should be returned
      req.flush({
        id: 1,
        enName: "United States",
        localeName: "United States",
      });
      expect(req.request.method).toBe("GET");
      // one request fire
      httpTestingController.verify();
    });
  });

  describe("createCountry", () => {
    fit("should call with correct url", () => {
      service
        .createCountry({
          id: 1,
          enName: "United States",
          localeName: "United States",
        } as Country)
        .subscribe((country) => {
          expect(country.enName).toBe("United States");
        });
      const req = httpTestingController.expectOne(
        "http://ec2-15-185-203-230.me-south-1.compute.amazonaws.com:8080/lookup-service/country"
      );
      // what data should be returned
      req.flush({
        id: 1,
        enName: "United States",
        localeName: "United States",
      });
      expect(req.request.method).toBe("POST");
      // one request fire
      httpTestingController.verify();
    });
  });
  describe("updateCountry", () => {
    fit("should call with correct url", () => {
      service
        .updateCountry(1, {
          id: 1,
          enName: "mohand",
          localeName: "mohand",
        } as Country)
        .subscribe((country) => {
          expect(country.enName).toBe("mohand");
        });
      const req = httpTestingController.expectOne(
        "http://ec2-15-185-203-230.me-south-1.compute.amazonaws.com:8080/lookup-service/country/1"
      );
      // what data should be returned
      req.flush({
        id: 1,
        enName: "mohand",
        localeName: "mohand",
      });
      expect(req.request.method).toBe("PUT");
      // one request fire
      httpTestingController.verify();
    });
  });
});
