import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CreateMerchantProductComponent } from "./create-merchant-product.component";

describe("CreateMerchantProductComponent", () => {
  let component: CreateMerchantProductComponent;
  let fixture: ComponentFixture<CreateMerchantProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMerchantProductComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMerchantProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
