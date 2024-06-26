import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmitService {
  private subject = new Subject<number>();
  private recordTableSource = new Subject();

  constructor() {
  }

  sendItemId(id: number) {
    this.subject.next(id);
  }

  getItemId(): Observable<number> {
    return this.subject.asObservable();
  }

  sendTableRecord(record: any) {
    this.recordTableSource.next(record);
  }

  getTableRecord(): Observable<any> {
    return this.recordTableSource.asObservable();
  }
}
