import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from "@angular/router";
import { AuthService } from "app/auth/auth.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserRoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const userRoles = this.authService.getLoggedInUserRoles();
    const userType = this.authService.getUserType()?.toLowerCase();
    if (userRoles.includes(route?.data?.role)) return true;
    this.router.navigate([`/${userType}/access-denied`]);
    return false;
  }
}
