import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ListMerchantProductsComponent } from "./list-merchant-products.component";

describe("ListMerchantProductsComponent", () => {
  let component: ListMerchantProductsComponent;
  let fixture: ComponentFixture<ListMerchantProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListMerchantProductsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMerchantProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
