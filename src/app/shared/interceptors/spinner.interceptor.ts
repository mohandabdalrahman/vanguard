import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { finalize } from 'rxjs/operators';
import { LoaderService } from '@shared/services/loader.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private LoaderService:LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.LoaderService.setLoading(true);
    return next.handle(request).pipe(finalize(()=>{
      this.LoaderService.setLoading(false);

    }));
  }
}
