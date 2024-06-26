import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListAttachmentsComponent } from "./list-attachments/list-attachments.component";

const routes: Routes = [
  {
    path: "",
    component: ListAttachmentsComponent,
    data: { pageTitle: "Attachments" },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttachmentsRoutingModule {}
