import { Injectable } from "@angular/core";
import { CanDeactivate, UrlTree } from "@angular/router";
import { SubmitForm } from "@models/form-guard.model";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FormGuard implements CanDeactivate<SubmitForm> {
  currentLang: String;

  constructor(private currentLangService: CurrentLangService) {}

  canDeactivate(
    component: SubmitForm
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (component.submitForm.dirty && !component.submitForm.submitted) {
      this.currentLang = this.currentLangService.getCurrentLang();
      return confirm(
        this.currentLang === "en"
          ? "Are you sure you want to leave?"
          : "هل أنت متأكد انك تريد الرجوع؟"
      );
    }
    return true;
  }
}
