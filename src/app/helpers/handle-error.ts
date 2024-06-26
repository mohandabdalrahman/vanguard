import { throwError } from "rxjs";

export const handleError = (err: any) => {
  if (err.status === 202) {
    return  throwError({status: err.status , msg: 'Successed'});
  }
  let errorMessage: string;
  if (err.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    errorMessage = `An error occurred: ${err?.error?.message ?? err.message}`;
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    errorMessage = `Backend returned code ${err?.status}: ${err?.error?.errorMessage}`;
  }
  console.error(err);
  return throwError(errorMessage);
};
