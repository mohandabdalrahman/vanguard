import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BaseResponse } from '@models/response.model';
import { viewer } from '@models/Viewer.model';
import { UserSearchObj } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  apiUrl: string;
  constructor(private http:HttpClient) {
    this.apiUrl = `${environment.baseUrl}/admin-user-service/user`;

   }
  
  GetViewerName(searchObj?:UserSearchObj): Observable<BaseResponse<viewer>> {
   return this.http.get<BaseResponse<viewer>>(`${this.apiUrl}`,
   {
    params: {
      ...searchObj,
    },
   }
   )
  }

  GetCorporateReViewerName(searchObj?:UserSearchObj): Observable<BaseResponse<viewer>> {
    return this.http.get<BaseResponse<viewer>>(`${environment.baseUrl}/corporate-user-service/user`,
    {
     params: {
       ...searchObj,
     },
    }
    )
   }
}
