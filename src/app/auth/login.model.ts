export interface Login {
  username: string;
  password: string;
}

export interface TokenInfo {
  roles: string[];
  userType: string;
  userId: number;
  relatedSystemId: number;
  relatedSystemIds?: number[];
  masterSystemId?: number;
  userCredentialId?: number;
  ouId?: number;
  ouTreeIds?: number[];
  ouEnabled?: boolean;
}

export enum UserType {
  admin = "ADMINISTRATION",
  merchant = "MERCHANT",
  corporate = "CORPORATE",
  masterCorporate = "MASTER_CORPORATE",
}

interface RefreshTokenDTO {
  token: string;
  expiryDate: string;
}

export interface TokenDTO {
  token: string;
  refreshTokenDto: RefreshTokenDTO;
}