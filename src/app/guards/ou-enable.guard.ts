import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class OuEnableGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }

  canActivate(): boolean {
    return this.authService.isOuEnabled() || this.authService.isAdminCorporateOuEnabled();
  }

}
