import {DatePipe} from "@angular/common";

export const formatDate = (date) => {
  const datePipe = new DatePipe('en-US')
  return datePipe.transform(date, 'dd-MM-yyyy HH:mm:ss');
}

export const parseDate = (date) => {
  const parseDate = date.split('-');
  return `${parseDate[2]}-${parseDate[1]}-${parseDate[0]}`
}