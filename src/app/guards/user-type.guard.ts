import { Injectable } from "@angular/core";
import { CanLoad, Route, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class UserTypeGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const userType = this.authService.getUserType()?.toLowerCase();
    if (userType === route.path) return true;
    else {
      this.router.navigate([`/${userType}`]);
      return false;
    }
  }
}
