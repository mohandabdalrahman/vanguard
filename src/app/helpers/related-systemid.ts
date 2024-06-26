import {Params} from "@angular/router";

export const getRelatedSystemId = (params: Params, key: string): string => {
  return (params && params[key]) || sessionStorage.getItem("relatedSystemId")
};