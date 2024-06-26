import {Component, OnInit} from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./admin-home.component.html",
  styleUrls: ["../../scss/home.component.scss"],
})
export class AdminHomeComponent implements OnInit {
  cards = [
    { name: "sites", count: 2000, icon: "/assets/img/admin-home/sites.svg" },
    { name: "users", count: 5000, icon: "/assets/img/admin-home/users.svg" },
    {
      name: "products",
      count: 6000,
      icon: "/assets/img/home/products.svg",
    },
    {
      name: "merchants",
      count: 900,
      icon: "/assets/img/admin-home/merchants.svg",
    },
    {
      name: "transactions",
      count: 900,
      icon: "/assets/img/admin-home/transactions.svg",
    },
    {
      name: "corporate",
      count: 900,
      icon: "/assets/img/admin-home/corporates.svg",
    },
    {
      name: "transactions",
      count: 900,
      icon: "/assets/img/admin-home/transactions.svg",
    },
    {
      name: "transactions",
      count: 900,
      icon: "/assets/img/admin-home/transactions.svg",
    },
  ];
  gridData: any[] = [
    {
      id: 1,
      name: "John Lilki",
      country: "egypt",
      locale: "Sales",
      status: "active",
    },
    {
      id: 2,
      name: "John Lilki",
      country: "egypt",
      locale: "Sales",
      status: "inactive",
    },
  ];
  colData: any[] = [
    { field: "id", header: "Merchant ID" },
    { field: "name", header: "merchants.name" },
    { field: "country", header: "Country" },
    { field: "locale", header: "Default locale" },
    { field: "status", header: "Status" },
  ];
  constructor() {}

  ngOnInit(): void {
  }
}
