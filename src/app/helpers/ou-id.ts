import {Params} from "@angular/router";

export const getOuId = (params: Params, key: string): string => {
  return (params && params[key]) || sessionStorage.getItem("ouId")
};