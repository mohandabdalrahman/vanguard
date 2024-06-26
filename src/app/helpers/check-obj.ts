export function isEmpty(object): boolean {
  return (object && Object.values(object).some((x) => x === null || x === ""));
}


// remove null properties from object
export function removeNullProps(obj: any) {
  obj && Object.keys(obj).forEach(key => (obj[key] === null || obj[key] === undefined || obj[key] === "") && delete obj[key]);
  return obj;
}
