import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  // private loading: boolean = false;
  loading=new BehaviorSubject(false)
  
  constructor() { }

  setLoading(loading: boolean) {
    this.loading.next(loading)
  }


}
