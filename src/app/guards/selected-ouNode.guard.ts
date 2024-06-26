import {Injectable} from '@angular/core';
import {CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class SelectedOuNodeGuard implements CanActivate {
  constructor(private router: Router, private authService:AuthService) {
  }

  canActivate(_, state: RouterStateSnapshot): boolean {
    if(this.authService.getUserType() === 'admin' || !this.authService.isOuEnabled()) return true;
    const entityName = state?.url?.split('/')[2];
    const selectedOuNode = JSON.parse(sessionStorage.getItem('selectedOuNode'))
    if (selectedOuNode?.id !== 0) {
      return true;
    } else {
      this.router.navigate([`/corporate/${entityName}`]);
      return false;
    }
  }

}
