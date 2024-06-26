import { Injectable } from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {

  constructor(private router:Router) { }


   addQueryParams(queryParamName: string, queryParam: number) {
    this.router.navigate([], {
      queryParams: { [queryParamName]: queryParam },
      queryParamsHandling: "merge",
    });
  }

  addManyQueryParameters(queryParamsObj) {
    this.router.navigate([], {
      queryParams: queryParamsObj,
      queryParamsHandling: "merge",
    });
  }
}
