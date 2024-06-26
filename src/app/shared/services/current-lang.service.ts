import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentLangService {

  constructor() {
  }

  getCurrentLang() {
    return localStorage.getItem("lang") || "ar";
  }
}
