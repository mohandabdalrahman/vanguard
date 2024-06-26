import { CommonModule } from "@angular/common";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import {
  NbActionsModule,
  NbCardModule,
  NbCheckboxModule,
  NbContextMenuModule,
  NbFormFieldModule,
  NbIconModule,
  NbLayoutModule,
  NbPopoverModule,
  NbSearchModule,
  NbSelectModule,
  NbSidebarModule,
  NbThemeModule,
  NbTooltipModule,
  NbUserModule,
} from "@nebular/theme";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import {
  DeleteModalComponent,
  FooterComponent,
  HeaderComponent,
  SearchInputComponent,
} from "./components";
import { BackButtonComponent } from "./components/back-button/back-button.component";
import { CardComponent } from "./components/card/card.component";
import { DataTableComponent } from "./components/data-table/data-table.component";
import { DownloadButtonComponent } from "./components/download-button/download-button.component";
import { ErrorComponent } from "./components/error/error.component";
import { FileExtensionIconComponent } from "./components/file-extension-icon/file-extension-icon.component";
import { HomeCardComponent } from "./components/home-card/home-card.component";
import { InputFieldComponent } from "./components/input-field/input-field.component";
import { ItemDetailsComponent } from "./components/item-details/item-details.component";
import { LabelComponent } from "./components/label/label.component";
import { LeftTableHeaderComponent } from "./components/left-table-header/left-table-header.component";
import { RightTableHeaderComponent } from "./components/right-table-header/right-table-header.component";
import { SearchComponent } from "./components/search/search.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { StatusComponent } from "./components/status/status.component";
import { TabHeaderComponent } from "./components/tab-header/tab-header.component";
import { TableControlsComponent } from "./components/table-controls/table-controls.component";
import { UpdateButtonComponent } from "./components/update-button/update-button.component";
import { OneColumnLayoutComponent } from "./layouts";
import { DEFAULT_THEME } from "./styles/theme.default";
import { TabsComponent } from "./components/tabs/tabs.component";
import { InvoiceModalComponent } from "./components/invoice-modal/invoice-modal.component";
import { ModalComponent } from "./components/modal/modal.component";
import { OverwriteConfirmModalComponent } from "./components/overwrite-confirm-modal/overwrite-confirm-modal.component";
import { PaginationComponent } from "./components/pagination/pagination.component";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { PrintButtonComponent } from "./components/print-button/print-button.component";
import { ExportButtonComponent } from "./components/export-button/export-button.component";
import { HasRoleDirective } from "@shared/directives/has-role.directive";
import { ScrollableTabsComponent } from "./components/scrollable-tabs/scrollable-tabs.component";
import { VcardComponent } from "./components/vcard/vcard.component";
import { QRCodeModule } from "angularx-qrcode";
import { DetailsDrawerComponent } from "./components/details-drawer/details-drawer.component";
import { BalanceDetailsDrawerComponent } from "./components/balance-details-drawer/balance-details-drawer.component";
import { TreeModule } from "@circlon/angular-tree-component";
import { TreeNodesComponent } from "@theme/components/tree/tree-nodes.component";
import { TooltipComponent } from "./components/tooltip/tooltip.component";
import { ContextMenuComponent } from "./components/context-menu/context-menu.component";
import { UnitTabsComponent } from "./components/unit-tabs/unit-tabs.component";
import { LoadingScreenComponent } from "./components/loading-screen/loading-screen.component";
import {FilterBtnComponent} from "@theme/components/filter-btn/filter-btn.component";
import { OuTabsComponent } from './components/ou-tabs/ou-tabs.component';
import { OuHierarchyTreeComponent } from './components/ou-hierarchy-tree/ou-hierarchy-tree.component';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { DetailsViewComponent } from './components/details-view/details-view.component';
import { AllLimitViewComponent } from './components/all-limit-view/all-limit-view.component';
import { CitiesViewComponent } from './components/cities-view/cities-view.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ConsumptionRateComponent } from "./components/consumption-rate/consumption-rate.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ButtonWithMenuComponent } from './components/button-with-menu/button-with-menu.component';
import { PopoverButtonComponent } from './popover-button/popover-button.component';
import { StatusStatisticsComponent } from './components/status-statistics/status-statistics.component';
import { OperatingValuesInputsComponent } from './components/operating-values-inputs/operating-values-inputs.component';
import { DailyOperationsValuesComponent } from './components/daily-operations-values/daily-operations-values.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { InfoDetailsComponent } from './components/info-details/info-details.component';
import { InfoDetailsStatusComponent } from './components/info-details-status/info-details-status.component';
import { PlateNumberComponent } from './components/plate-number/plate-number.component';
import { InfoDetailsWithIconComponent } from "./components/info-details-with-icon/info-details-icon.component";
import { InfoDetailsTagComponent } from './components/info-details-tag/info-details-tag.component';
import { InfoDetailsMenuComponent } from './components/info-details-menu/info-details-menu.component';


const NB_MODULES = [
  NbLayoutModule,
  NbActionsModule,
  NbSearchModule,
  NbSidebarModule,
  NbIconModule,
  NbEvaIconsModule,
  FormsModule,
  NbPopoverModule,
  RouterModule,
  NbFormFieldModule,
  NbSelectModule,
  NgSelectModule,
  NgbPaginationModule,
  QRCodeModule,
  TreeModule,
  NbTooltipModule,
  NgxChartsModule
];
const COMPONENTS = [
  HeaderComponent,
  FooterComponent,
  SearchInputComponent,
  OneColumnLayoutComponent,
  DeleteModalComponent,
  ProgressComponent,
  SearchComponent,
  TableControlsComponent,
  CitiesViewComponent,
  InputFieldComponent,
  BackButtonComponent,
  ItemDetailsComponent,
  DataTableComponent,
  GridViewComponent,
  DetailsViewComponent,
  CardComponent,
  HomeCardComponent,
  LabelComponent,
  SpinnerComponent,
  ErrorComponent,
  StatusComponent,
  UpdateButtonComponent,
  LeftTableHeaderComponent,
  RightTableHeaderComponent,
  TabHeaderComponent,
  DownloadButtonComponent,
  FileExtensionIconComponent,
  TabsComponent,
  InvoiceModalComponent,
  ModalComponent,
  OverwriteConfirmModalComponent,
  PaginationComponent,
  PrintButtonComponent,
  ExportButtonComponent,
  HasRoleDirective,
  ScrollableTabsComponent,
  VcardComponent,
  DetailsDrawerComponent,
  BalanceDetailsDrawerComponent,
  TreeNodesComponent,
  TreeViewComponent,
  TooltipComponent,
  AllLimitViewComponent,
  ContextMenuComponent,
  UnitTabsComponent,
  LoadingScreenComponent,
  FilterBtnComponent,
  OuTabsComponent,
  OuHierarchyTreeComponent,
  ConsumptionRateComponent,
  ButtonWithMenuComponent,
  PopoverButtonComponent,
  StatusStatisticsComponent,
  OperatingValuesInputsComponent,
  ButtonWithMenuComponent,
  DailyOperationsValuesComponent,
  InfoDetailsComponent,
  InfoDetailsStatusComponent,
  PlateNumberComponent,
  InfoDetailsWithIconComponent,
  InfoDetailsTagComponent,
  InfoDetailsMenuComponent
];

@NgModule({
  imports: [
    CommonModule,
    NbCheckboxModule,
    NbUserModule,
    NbContextMenuModule,
    ...NB_MODULES,
    TranslateModule.forChild({extend: true}),
    NbCardModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CommonModule, NbSelectModule, NgSelectModule, NgbPaginationModule, ...COMPONENTS],
  declarations: [...COMPONENTS],
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders<ThemeModule> {
    return {
      ngModule: ThemeModule,
      providers: [
        ...NbThemeModule.forRoot(
          {
            name: "default",
          },
          [DEFAULT_THEME]
        ).providers,
      ],
    };
  }
}
