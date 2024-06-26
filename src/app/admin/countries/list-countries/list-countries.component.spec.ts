import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { ErrorService } from "@shared/services/error.service";

import { ToastrModule, ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { CountryService } from "../country.service";
import { ListCountriesComponent } from "./list-countries.component";
describe("ListCountriesComponent", () => {
  let component: ListCountriesComponent;
  let fixture: ComponentFixture<ListCountriesComponent>;
  let mockCountryService;
  let countries;

  beforeEach(async () => {
    countries = [
      {
        id: 1,
        enName: "United States",
        localeName: "United States",
        currency: "USD",
        status: "active",
      },
      {
        id: 2,
        enName: "United Kingdom",
        localeName: "United Kingdom",
        currency: "GBP",
        status: "active",
      },
    ];
    mockCountryService = jasmine.createSpyObj(["getCountries"]);
    await TestBed.configureTestingModule({
      declarations: [ListCountriesComponent],
      providers: [
        NgxSpinnerService,
        ToastrService,
        ErrorService,
        TranslateService,
        { provide: CountryService, useValue: mockCountryService },
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
        FormsModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should set countries correctly from the service", () => {
    mockCountryService.getCountries.and.returnValue(of(countries));
    expect(component.countries.length).toBe(2);
  });
});
