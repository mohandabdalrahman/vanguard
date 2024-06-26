import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor( private authService: AuthService) {

  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // add authorization header with jwt token if available
    const token = sessionStorage.getItem("token");
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
    }

    return next.handle(request).pipe(catchError((err) => {
      if (err?.status === 401) {
        this.handleAuthError();
      }
      throw err;
    }));
  }

  handleAuthError() {
    this.authService.logout();
  }


}
