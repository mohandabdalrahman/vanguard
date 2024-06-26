import {Base} from "@models/Base.model";
import {PolicyType} from "../corporate-policy/corporate-policy.model";

// import {TreeNode} from "angular13-organization-chart";

interface SecurityProfile {
  id: number;
  value: string;
  description: string;
}

interface MandatoryField {
  id: number;
  field: string;
}

interface Role extends Base {
  description: string;
  systemType: string;
  securityProfiles: SecurityProfile[];
  mandatoryFields: MandatoryField[];
  tag: string;
}

export interface Admin extends Base {
  description: string;
  username: string;
  email: string;
  mobileNumber: string;
  address: string;
  typeId: number;
  nfcIds: number[];
  nfcId: number;
  relatedSystemId: number;
  masterSystemId: number;
  roles: Role[];
  corporateUserId: string;
  ouId: number;
}

interface BillingAccountOu {
  id: number;
  inputBalancePercent: number;
  autoDistribution: boolean;
  selfPercent: number;
  bufferPercent: number;
  bufferBalance: number;
  monthlyConsumption: number;
  currentBalance: number;
  totalLimit: number;
  outputBalanceDistributionMode: BalanceDistributionMode | string;
  inputBalanceDistributionMode: BalanceDistributionMode | string;
}

export class CorporateOu extends Base {
  description: string;
  corporateId: number;
  type: OuType | string;
  parentId: number;
  cityId: number;
  transferAdminIds: number[];
  allowedProductCategoryIds: number[] = [0];
  admins: Admin[] | any[] = [];
  billingAccount: BillingAccountOu = {
    autoDistribution: false,
    outputBalanceDistributionMode: undefined,
    inputBalanceDistributionMode: undefined,
    bufferBalance: 0,
    bufferPercent: 0,
    currentBalance: 0,
    id: 0,
    inputBalancePercent: 0,
    monthlyConsumption: 0,
    selfPercent: 0,
    totalLimit: 0,
  };
}

export enum BalanceDistributionMode {
  balance = "BY_BALANCE",
  limit = "BY_LIMIT",
}

export enum OuType {
  main = "MAIN",
  branch = "BRANCH",
}

class TreeNode {
  children: TreeNode[];
  hideChildren?: boolean;
  onClick?: () => void;
  cssClass?: string = "subChild";
  css?: string;
}

export class OuNode extends TreeNode {
  enName: string;
  localeName: string;
  id: number;
  type: OuType;
  children: OuNode[];
  inputBalanceDistributionMode: BalanceDistributionMode;
  outputBalanceDistributionMode: BalanceDistributionMode;
}

export class OuTreeNode extends TreeNode {
  children: OuNode[] = [];
  level: number;

  numberOfMainChild: number;
  numberOfBranchChild: number;
  id: number;
}

export interface CorporateOuBrief {
  id: number;
  localeName: string;
  enName: string;
  type: OuType;
  monthlyConsumption: number;
  currentBalance: number;
  availableLimit: number;
  balanceDistributionMode: BalanceDistributionMode;
}

// export interface PolicyCount {
//   RECURRING: number,
//   ONE_TIME: number
// }

class PolicyCountPerOuDto {
  ouId: number;
  policyCounts = new Map<PolicyType, number>();
}

export class PolicyCountResponseDto {
  countsPerOu: PolicyCountPerOuDto[];
  totalCountsPerType = new Map<PolicyType, number>();
}

export class BalanceDistributionDto extends TreeNode {
  id: number;
  localeName: string;
  enName: string;
  type: string;
  autoDistribution: boolean;
  inputBalancePercent: number;
  inputBalance: number = 0;
  currentBalance: number;
  bufferPercent: number;
  bufferBalance: number = 0;
  selfPercent: number;
  selfAmount: number;
  monthlyConsumption: number;
  allUnitsMonthlyConsumption: number;
  totalLimit: number;
  totalLimitPercent: number = 0;
  inputBalanceDistributionMode: string;
  outputBalanceDistributionMode: string;
  availableBalancePercent = 0;
  availableBalanceAmount = 0;
  initialBufferBalance = 0;
  hybridOuShowBalanceInsteadOfBuffer?: boolean;
}

export class OuBalanceDistribution extends  BalanceDistributionDto {

  children: BalanceDistributionDto[] = [];
  numberOfByLimitChild?: number;
  numberOfByBalanceChild?: number;
}

export interface OuListSearch{
    corporateId?: number;
    suspended?: boolean;
    ouIds: number[];
}