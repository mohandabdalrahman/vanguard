import {Injectable} from "@angular/core";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
  }

  handleErrorResponse(error: string, msg?: string) {
    // handle 403 error
    if (error?.trim()?.includes("403: Access is denied")) {
      this.translate.get("error.code.403").subscribe((res) => {
        this.toastr.error(res, "Error");
      });
    } else {
      msg ? this.toastr.error(msg, "Error") : this.toastr.error(error, "Error");
    }
  }
}
