export const addDays = (timestamp: number, noOfDaysAdded: number)=> {
  let date = new Date(timestamp);
  date.setDate(date.getDate() + noOfDaysAdded);

  return date.getTime();
}

export const addMonths = (timestamp: number, noOfMonthsAdded: number)=> {
  let date = new Date(timestamp);
  date.setMonth(date.getMonth() + noOfMonthsAdded);

  return date.getTime();
}

export const fixTimeZone = (timestamp: number)=> {
  let date = new Date(timestamp);
  let timeZoneOffset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + timeZoneOffset);
  return date.getTime();

}
