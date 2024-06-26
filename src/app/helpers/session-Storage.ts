export const setsessionStorage = (key: string, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getsessionStorage = (key: string) => {
  return JSON.parse(sessionStorage.getItem(key));
};