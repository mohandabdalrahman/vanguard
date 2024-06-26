import {CorporateRole} from "../corporates/corporate-roles";

export const unitCorporateTabs = [
  { name: "mainInfo", path: "main-info", role: CorporateRole.OU_VIEW },
  { name: "corporate.users", path: "users", role: CorporateRole.USER_LIST },
  {
    name: "corporate.vehicles",
    path: "vehicles",
    role: CorporateRole.ASSET_LIST,
  },
  // {
  //   name: "corporate.hardwares",
  //   path: "hardwares",
  //   role: CorporateRole.ASSET_LIST,
  // },
  // {
  //   name: "corporate.containers",
  //   path: "containers",
  //   role: CorporateRole.ASSET_LIST,
  // },
  {
    name: "corporate.policies",
    path: "policies",
    role: CorporateRole.POLICY_LIST,
  },
  {
    name: "corporate.cardHolders",
    path: "card-holders",
    role: CorporateRole.ASSET_LIST,
  },
  {
    name: "corporate.transactions",
    path: "transactions",
    role: CorporateRole.TRANSACTION_LIST,
  },
  {
    name: "corporate.alerts",
    path: "alerts",
    role: CorporateRole.ALERT_LIST,
  },

];
