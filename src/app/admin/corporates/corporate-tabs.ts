import { CorporateRole } from "./corporate-roles";

export const corporateTabs = [
  {
    name: "corporate.billingAccount",
    path: "billing-account",
    role: CorporateRole.CORPORATE_BILLING_ACCOUNT_VIEW,
  },
  { name: "corporate.users", path: "users", role: CorporateRole.USER_LIST },
  {
    name: "corporate.contacts",
    path: "contacts",
    role: CorporateRole.CORPORATE_CONTACT_LIST,
  },
  // { name: "corporate.cards", path: "cards", role: CorporateRole.NFC_LIST },
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
    name: "corporate.invoices",
    path: "invoices",
    role: CorporateRole.INVOICE_LIST,
  },
  {
    name: "corporate.cardHolders",
    path: "card-holders",
    role: CorporateRole.ASSET_LIST,
  },
  { name: "corporate.bills", path: "bills", role: CorporateRole.BILL_LIST },
  {
    name: "corporate.transactions",
    path: "transactions",
    role: CorporateRole.TRANSACTION_LIST,
  },
  // {
  //   name: "merchant.attachments",
  //   path: "attachments",
  //   role: CorporateRole.CORPORATE_DOCUMENT_LIST,
  // },
  {
    name: "corporate.alerts",
    path: "alerts",
    role: CorporateRole.ALERT_LIST,
  },
  {
    name: "corporate.reports",
    path: "reports",
    role: CorporateRole.SALES_VIEW,
  },
  {
    name: "corporate.dashboard",
    path: "dashboard",
    role: CorporateRole.DASHBOARD_VIEW,
  },
];
