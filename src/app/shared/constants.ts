export const EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
export const USERNAME_REGEX =
  "^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,20}[a-zA-Z0-9]$";
export const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$";
export const OU_IDS_LENGTH = 200;