import {MerchantRole} from "./merchant-roles";

export const merchantTabs = [
  {
    name: "merchant.billingAccount",
    path: "billing-account",
    role: MerchantRole.MERCHANT_BILLING_ACCOUNT_VIEW,
  },
  {
    name: "merchant.users",
    path: "users",
    role: MerchantRole.USER_LIST,
  },
  {
    name: "merchant.sites",
    path: "sites",
    role: MerchantRole.SITE_LIST,
  },
  {
    name: "merchant.products",
    path: "products",
    role: MerchantRole.PRODUCT_LIST,
  },
  {
    name: "merchant.bankAccounts",
    path: "bank-accounts",
    role: MerchantRole.MERCHANT_BANK_ACCOUNT_LIST,
  },
  // { name: "merchant.reports", path: "#" },
  {
    name: "merchant.contacts",
    path: "contacts",
    role: MerchantRole.MERCHANT_CONTACT_LIST,
  },
  {
    name: "merchant.attachments",
    path: "attachments",
    role: MerchantRole.MERCHANT_DOCUMENT_LIST,
  },
  {
    name: "merchant.invoices",
    path: "invoices",
    role: MerchantRole.INVOICE_LIST,
  },
  {
    name: "merchant.tokens",
    path: "tokens",
    role: MerchantRole.NFC_LIST,
  },
  {
    name: "merchant.transactions",
    path: "transactions",
    role: MerchantRole.TRANSACTION_LIST,
  },
  {
    name: "merchant.deposits",
    path: "deposits",
    role: MerchantRole.DEPOSITS_LIST,
  },
  {
    name: "merchant.tips",
    path: "tips",
    role: MerchantRole.TIPS_LIST,
  },
  {
    name: "merchant.reports",
    path: "reports",
    role: MerchantRole.DASHBOARD_VIEW,
  },
];
