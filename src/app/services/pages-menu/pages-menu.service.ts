import {Injectable} from "@angular/core";
import {NbIconLibraries, NbMenuItem} from "@nebular/theme";
import {menuIcons} from "@services/pages-menu/page-menu-icons";
import {AuthService} from "../../auth/auth.service";

export interface MenuItem extends NbMenuItem {
  userType?: string;
  role?: string;
  key?: string;
  children?: MenuItem[];
}

@Injectable({
  providedIn: "root",
})
export class PagesMenuService {
  constructor(private iconLibraries: NbIconLibraries , private authService: AuthService) {
    this.iconLibraries.registerSvgPack("menu-icons", {
      ...menuIcons,
    });
  }

  loadMenuItems(userType: string, roles?: string[]): NbMenuItem[] {
   const menuItems=[
     {
       title: "Home",
       icon: "home-outline",
       link: "/admin/home",
       userType: "admin",
       role: "DASHBOARD_VIEW",
       home: true,
       key: "home",
     },
     {
       title: "Reports",
       userType: "admin",
       role: "SALES_VIEW",
       icon: "file-text-outline",
       link: "/admin/reports",
       key: "reports",
     },
     {
       title: "Requests",
       userType: "admin",
       role: "SALES_VIEW",
       icon: "archive-outline",
       key: "requests",
       children: [
         {
           title: "Merchants",
           link: "/admin/requests/merchants",
           key: "merchants",
           role: "MERCHANT_LIST",
         },
         {
           title: "Corporates",
           link: "/admin/requests/corporates",
           key: "Corporates",
           role: "CORPORATE_LIST",
         },
         {
           title: "Admin",
           link: "/admin/requests/admin",
           key: "admin",
           role: "CORPORATE_LIST",
         },
       ],
     },
     {
       title: "Merchants",
       link: "/admin/merchants",
       icon: "car-outline",
       userType: "admin",
       role: "MERCHANT_LIST",
       key: "merchants",
     },
     {
       title: "Corporates",
       link: "/admin/corporates",
       icon: "briefcase-outline",
       userType: "admin",
       role: "CORPORATE_LIST",
       key: "Corporates",
     },
     {
       title: "Master Entity",
       icon: "shuffle-2-outline",
       userType: "admin",
       role: "MASTER_CORPORATE_LIST, MASTER_MERCHANT_LIST",
       key: "master-entity",
       children: [
         {
           title: "Master Merchants",
           link: "/admin/master-merchants",
           key: "master-merchants",
           role: "MASTER_MERCHANT_LIST",
         },
         {
           title: "Master Corporates",
           link: "/admin/master-corporates",
           key: "master-corporates",
           role: "MASTER_CORPORATE_LIST",
         },
       ],
     },
     {
       title: "Access Management",
       icon: "people-outline",
       userType: "admin",
       key: "access-management",
       role: "ROLE_LIST,USER_LIST",
       children: [
         {
           title: "User Roles Management",
           link: "/admin/user-roles",
           key: "user-roles-management",
           role: "ROLE_LIST",
         },
         {
           title: "Users Management",
           link: "/admin/users",
           key: "users-management",
           role: "USER_LIST",
         },
       ],
     },
     {
       title: "Admin",
       icon: "globe-outline",
       userType: "admin",
       key: "admin",
       role: "COUNTRY_LIST,BANK_LIST,PRODUCT_CATEGORY_LIST,PRODUCT_LIST",
       children: [
         {
           title: "Countries",
           link: "/admin/countries",
           key: "countries",
           role: "COUNTRY_LIST",
         },
         {
           title: "Contact Types",
           key: "contact-types",
         },
         // {
         //   title: "Vehicle Types",
         //   key: "vehicle-types",
         // },
         {
           title: "Banks",
           link: "/admin/banks",
           key: "banks",
           role: "BANK_LIST",
         },
         {
           title: "Attachment Types",
           key: "attachment-types",
         },
         {
           title: "Product Categories",
           link: "/admin/product-category",
           key: "product-categories",
           role: "PRODUCT_CATEGORY_LIST",
         },
         {
           title: "Global Product",
           link: "/admin/global-product",
           key: "global-product",
           role: "PRODUCT_LIST",
         },
       ],
     },
     {
       title: "Accounting",
       icon: "save-outline",
       userType: "admin",
       key: "accounting",
       role: "INVOICE_LIST",
       children: [
         {
           title: "Invoices",
           key: "invoices",
           role: "INVOICE_LIST",
           icon: {icon: "invoice", pack: "menu-icons"},
           link: "/admin/invoices",
         },
         // {title: "Settlement", key: "settlement"},
         // {title: "Top ups", key: "top-ups"},
       ],
     },
     {
       title: "Transactions",
       icon: "flip-2-outline",
       link: "/admin/transactions",
       userType: "admin",
       role: "TRANSACTION_LIST",
       key: "transactions",
     },
     {
       title: "Invoice Tracking System",
       userType: "admin",
       icon: "grid-outline",
       key: "invoice-tracking-system",
     },
     {
       title: "Reports",
       userType: "admin",
       icon: "file-text-outline",
       key: "reports",
     },
     {
       title: "Top Ups",
       icon: {icon: "billing-account", pack: "menu-icons"},
       link: "/admin/top-ups",
       userType: "admin",
       role: "CORPORATE_BILLING_ACCOUNT_VIEW",
       key: "top-ups",
     },
     {
      title: "OTUs",
      icon: {icon: "otu", pack: "menu-icons"},
      link: "/admin/otus",
      userType: "admin",
      role: "OTU_VIEW",
      key: "otus",
    },
     //MERCHANT userType
     {
       title: "Home",
       icon: "home-outline",
       link: "/merchant/home",
       userType: "merchant",
       role: "MERCHANT_VIEW",
       home: true,
       key: "home",
     },
     {
       title: "Account Information",
       link: "/merchant/account-info",
       icon: "grid-outline",
       userType: "merchant",
       role: "MERCHANT_VIEW",
       key: "account-information",
     },
     {
       title: "Billing Account",
       link: "/merchant/billing-account",
       icon: {icon: "billing-account", pack: "menu-icons"},
       userType: "merchant",
       role: "MERCHANT_BILLING_ACCOUNT_VIEW",
       key: "billing-account",
     },
     {
       title: "My Sites",
       icon: {icon: "site", pack: "menu-icons"},
       link: "/merchant/sites",
       userType: "merchant",
       role: "SITE_VIEW",
       key: "my-sites",
     },
     {
       title: "My Users",
       icon: "people-outline",
       link: "/merchant/users",
       userType: "merchant",
       role: "USER_LIST",
       key: "my-users",
     },
     {
       title: "My Products",
       icon: {icon: "product", pack: "menu-icons"},
       link: "/merchant/products",
       userType: "merchant",
       role: "PRODUCT_LIST",
       key: "my-products",
     },
     {
       title: "My Contacts",
       icon: {icon: "contact", pack: "menu-icons"},
       link: "/merchant/contacts",
       userType: "merchant",
       role: "MERCHANT_CONTACT_LIST",
       key: "my-contacts",
     },
     {
       title: "Bank Accounts",
       icon: {icon: "bank-account", pack: "menu-icons"},
       link: "/merchant/bank-accounts",
       userType: "merchant",
       role: "MERCHANT_BANK_ACCOUNT_LIST",
       key: "bank-accounts",
     },
     {
       title: "Invoices",
       icon: {icon: "invoice", pack: "menu-icons"},
       userType: "merchant",
       role: "INVOICE_LIST",
       link: "/merchant/invoices",
       key: "invoices",
     },
     {
       title: "Tokens",
       icon: {icon: "card", pack: "menu-icons"},
       link: "/merchant/tokens",
       userType: "merchant",
       role: "NFC_LIST",
       key: "tokens",
     },
     {
       title: "Reports",
       userType: "merchant",
       role: "SALES_VIEW",
       icon: "file-text-outline",
       link: "/merchant/merchant-sales",
       key: "reports",
     },
     {
       title: "Transactions",
       icon: "flip-2-outline",
       link: "/merchant/transactions",
       userType: "merchant",
       role: "TRANSACTION_LIST",
       key: "transactions",
     },
     // {
     //   title: "Settlement",
     //   icon: "grid-outline",
     //   userType: "merchant",
     // },
     {
       title: "Attachments",
       icon: {icon: "attachment", pack: "menu-icons"},
       link: "/merchant/attachments",
       userType: "merchant",
       role: "MERCHANT_DOCUMENT_LIST",
       key: "attachments",
     },
     {
       title: "deposits",
       icon: "shopping-bag-outline",
       link: "/merchant/deposits",
       userType: "merchant",
       role: "MERCHANT_DOCUMENT_LIST",
       key: "deposits",
     },
     //  CORPORATE userType
     {
       title: "Home",
       icon: "home-outline",
       link: "/corporate/home",
       userType: "corporate",
       role: "CORPORATE_VIEW",
       home: true,
       key: "home",
     },
     {
       title: "Account Information",
       icon: "grid-outline",
       link: "/corporate/account-info",
       userType: "corporate",
       role: "CORPORATE_VIEW",
       key: "account-information",
     },
     this.authService.isOuEnabled()  && {
       title: "Organizational Chart",
       userType: "corporate",
       role: "OU_VIEW",
       icon: "grid-outline",
       key: "organizational-chart",
       children: [
         {
           title: "Units",
           link: "/corporate/organizational-chart/units",
           key: "units",
           role: "OU_VIEW",
         },
         {
           title: "userAssignment",
           link: "/corporate/organizational-chart/units/assignment",
           key: "userAssignment",
           role: "CORPORATE_USER_TRANSFER",
         },
         {
          title: "assetTransfer",
          link: "/corporate/organizational-chart/units/assetTransfer",
          key: "assetTransfer",
          role: "ASSET_TRANSFER",
        },
         {
           title: "Balance Distribution",
           link: "/corporate/organizational-chart/balance-distribution",
           key: "balance-distribution",
           role: "OU_BALANCE_DISTRIBUTE",
         },
       ],
     },
     this.authService.isOuEnabled()  && {
       title: "Balance Transfer",
       link: "/corporate/balance-transfer",
       userType: "corporate",
       role: "OU_BALANCE_TRANSFER",
       icon: "grid-outline",
       key: "balance-transfer",
     },
     {
       title: "Users",
       icon: "people-outline",
       link: "/corporate/users",
       userType: "corporate",
       role: "USER_LIST",
       key: "users",
     },
     {
       title: "Contacts",
       icon: {icon: "contact", pack: "menu-icons"},
       link: "/corporate/contacts",
       userType: "corporate",
       role: "CORPORATE_CONTACT_LIST",
       key: "contacts",
     },
     {
       title: "Polices",
       icon: {icon: "policy", pack: "menu-icons"},
       link: "/corporate/policies",
       userType: "corporate",
       role: "POLICY_LIST",
       key: "polices",
     },
     {
       title: "Invoices",
       icon: {icon: "invoice", pack: "menu-icons"},
       link: "/corporate/invoices",
       userType: "corporate",
       role: "INVOICE_LIST",
       key: "invoices",
     },

     {
       title: "Manex Bills",
       icon: {icon: "bill", pack: "menu-icons"},
       link: "/corporate/bills",
       userType: "corporate",
       role: "BILL_LIST",
       key: "manex-bills",
     },
     {
       title: "Billing Account",
       icon: {icon: "billing-account", pack: "menu-icons"},
       link: "/corporate/billing-account",
       userType: "corporate",
       role: "CORPORATE_BILLING_ACCOUNT_VIEW",
       key: "billing-account",
     },
     {
       title: "Card Holder",
       icon: {icon: "test-card", pack: "menu-icons"},
       link: "/corporate/card-holder",
       userType: "corporate",
       role: "ASSET_LIST",
       key: "card-holder",
     },
     // {
     //   title: "Container",
     //   icon: {icon: "container", pack: "menu-icons"},
     //   link: "/corporate/containers",
     //   userType: "corporate",
     //   key: "container",
     // },
     {
       title: "Vehicle",
       icon: {icon: "vehicle", pack: "menu-icons"},
       link: "/corporate/vehicles",
       userType: "corporate",
       role: "ASSET_LIST",
       key: "vehicle",
     },
     // {
     //   title: "Hardware",
     //   icon: {icon: "hardware", pack: "menu-icons"},
     //   link: "/corporate/hardwares",
     //   userType: "corporate",
     //   key: "hardware",
     // },
     {
       title: "Alerts",
       icon: {icon: "card", pack: "menu-icons"},
       link: "/corporate/alerts",
       userType: "corporate",
       role: "ALERT_LIST",
       key: "alerts",
     },
     {
       title: "Reports",
       icon: "file-text-outline",
       link: "/corporate/reports",
       userType: "corporate",
       role: "SALES_VIEW",
       key: "reports",
     },
     {
       title: "Transactions",
       icon: "flip-2-outline",
       link: "/corporate/transactions",
       userType: "corporate",
       role: "TRANSACTION_LIST",
       key: "transactions",
     },
     {
       title: "Attachments",
       icon: {icon: "attachment", pack: "menu-icons"},
       link: "/corporate/attachments",

       userType: "corporate",
       role: "CORPORATE_DOCUMENT_LIST",
       key: "attachments",
     },
     //  masterCorporate user type
     {
       title: "Home",
       icon: "home-outline",
       link: "/master_corporate/home",
       userType: "MASTER_CORPORATE",
       role: "CORPORATE_VIEW",
       home: true,
       key: "home",
     },
     {
       title: "Corporates",
       link: "/master_corporate/corporates",
       icon: "briefcase-outline",
       userType: "MASTER_CORPORATE",
       role: "CORPORATE_LIST",
       key: "Corporates",
     },
     {
       title: "Invoices",
       icon: {icon: "invoice", pack: "menu-icons"},
       link: "/master_corporate/invoices",
       userType: "MASTER_CORPORATE",
       role: "INVOICE_LIST",
       key: "invoices",
     },

     {
       title: "Manex Bills",
       icon: {icon: "bill", pack: "menu-icons"},
       link: "/master_corporate/bills",
       userType: "MASTER_CORPORATE",
       role: "BILL_LIST",
       key: "manex-bills",
     },
     {
       title: "Top Ups",
       icon: {icon: "billing-account", pack: "menu-icons"},
       link: "/master_corporate/top-ups",
       userType: "MASTER_CORPORATE",
       role: "CORPORATE_BILLING_ACCOUNT_VIEW",
       key: "top-ups",
     },
     {
       title: "Alerts",
       icon: {icon: "card", pack: "menu-icons"},
       link: "/master_corporate/alerts",
       userType: "MASTER_CORPORATE",
       role: "ALERT_LIST",
       key: "alerts",
     },
     {
       title: "Reports",
       icon: "file-text-outline",
       link: "/master_corporate/reports",
       userType: "MASTER_CORPORATE",
       role: "SALES_VIEW",
       key: "reports",
     },
     {
       title: "Transactions",
       icon: "flip-2-outline",
       link: "/master_corporate/transactions",
       userType: "MASTER_CORPORATE",
       role: "TRANSACTION_LIST",
       key: "transactions",
     },
   ];
    return menuItems.filter((menuItem) => {
      if (menuItem?.children?.length) {
        menuItem.children = menuItem?.children?.filter((child) => {
          return (
            roles?.some((role) => child?.role?.split(",").includes(role))
          );
        })

      }
      return (
        menuItem?.userType?.includes(userType) &&
        roles?.some((role) => menuItem?.role?.split(",").includes(role))
      );
    });
  }
}
