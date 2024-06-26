import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {SubSink} from "subsink";
import {BalanceDistributionDto, OuBalanceDistribution} from "../../organizational-chart/corporate-ou.model";
import {CorporateOuService} from "../../organizational-chart/corporate-ou.service";
import {ErrorService} from "@shared/services/error.service";
import {getRelatedSystemId} from "@helpers/related-systemid";
import {AuthService} from "../../../auth/auth.service";
import {CurrentLangService} from "@shared/services/current-lang.service";
import {NbStepperComponent} from "@nebular/theme/components/stepper/stepper.component";
import {ModalComponent} from "@theme/components/modal/modal.component";
import {TranslateService} from "@ngx-translate/core";
import { ToastrService } from 'ngx-toastr';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '@shared/services/loader.service';


type TransferType = 'from' | 'to';

@Component({
  selector: 'app-create-balance-transfer',
  templateUrl: './create-balance-transfer.component.html',
  styleUrls: ['./create-balance-transfer.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CreateBalanceTransferComponent implements OnInit {
  private subs = new SubSink();
  @ViewChild("stepper") private stepperComponent: NbStepperComponent;
  @ViewChild("confirmTransfer")  confirmModalComponent: ModalComponent;

  listCorporateOus = [new OuBalanceDistribution()];
  corporateId: number;
  ouId: number;
  fromOu: BalanceDistributionDto;
  toOu: BalanceDistributionDto;
  currentLang: string;
  selectedStep = 0;
  availableForTransfer: number;
  bufferBalanceAfterTransfer: number;
  exchangeBalanceAfterTransfer: number;
  bufferBalanceAfterTransferToOU: number;
  balanceToBeTransfered: number;
  nodeToBeDimmed: any;
  userType: string;

  constructor(
    private LoaderService: LoaderService,
    private corporateOuService: CorporateOuService,
    private errorService: ErrorService,
    private authService: AuthService,
    private currentLangService: CurrentLangService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute

  ) {
  }

  ngOnInit(): void {
    this.userType = this.authService.getUserType().toUpperCase();
    if(this.userType=='ADMIN'){

      this.ouId = this.authService.getRootOuId();
    }else{
      this.ouId = this.authService.getOuId();

    }
    this.currentLang = this.currentLangService.getCurrentLang();
    this.route.params.subscribe((params) => {
      this.corporateId = +getRelatedSystemId(params, "corporateId");
    })
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.currentLang = lang;
      }),
    )
    this.getOuBalanceHierarchy();

  }

  getOuBalanceHierarchy(): void {
    this.subs.add(
      this.corporateOuService
        .getOuBalanceHierarchy(this.corporateId, this.ouId)
        .subscribe(
          (corporateOus) => {
            if (corporateOus) {
              this.listCorporateOus = [corporateOus];
            }
          },
          (err) => {
            this.errorService.handleErrorResponse(err);
          }
        )
    );
  }

  transferBalance(){   
    this.subs.add(
      this.corporateOuService.ouBalanceTransfer(this.corporateId, this.fromOu?.id, this.toOu?.id, this.balanceToBeTransfered)
      .subscribe(
        () => {
          this.LoaderService.setLoading(true);
          this.translate
            .get(["success.balanceTransfer"])
            .subscribe((res) => {
            this.handleSuccessResponse(Object.values(res)[0] as string)
          });
          this.modalService.dismissAll();
          this.LoaderService.setLoading(false);
        },
        (err) => {
          this.errorService.handleErrorResponse(err);
          this.balanceToBeTransfered = null
        }
      )
    )
  }

  getSelectedOu(ouNode: BalanceDistributionDto, transferType: TransferType): void {
    if(!ouNode) return;
    if (transferType === 'from') {
      this.fromOu = ouNode;
    } else {
      this.toOu = ouNode;
      this.availableForTransfer = this.fromOu?.bufferBalance + this.fromOu?.currentBalance;
      this.bufferBalanceAfterTransfer = this.fromOu?.bufferBalance;
      this.exchangeBalanceAfterTransfer = this.fromOu?.currentBalance;
      this.bufferBalanceAfterTransferToOU = this.toOu?.bufferBalance
    }
  }

  calculateBalanceTransfer(inputValue: number){
    this.balanceToBeTransfered = +inputValue;
    this.availableForTransfer = this.fromOu?.bufferBalance + this.fromOu?.currentBalance;
    if(this.fromOu && this.toOu){
      if(this.balanceToBeTransfered && this.balanceToBeTransfered>0 ){
        if (this.balanceToBeTransfered <= this.availableForTransfer){
          this.bufferBalanceAfterTransferToOU =  this.balanceToBeTransfered + this.toOu?.bufferBalance;
          if(this.balanceToBeTransfered <= this.fromOu?.bufferBalance){
            this.availableForTransfer = this.availableForTransfer - this.balanceToBeTransfered;
            this.bufferBalanceAfterTransfer = this.fromOu?.bufferBalance - this.balanceToBeTransfered;
            this.exchangeBalanceAfterTransfer = this.fromOu?.currentBalance;
          } else {
            this.availableForTransfer = (this.fromOu?.bufferBalance + this.fromOu?.currentBalance) - this.balanceToBeTransfered;
            this.bufferBalanceAfterTransfer = 0;
            this.exchangeBalanceAfterTransfer = this.fromOu?.currentBalance - (this.fromOu?.bufferBalance-this.balanceToBeTransfered)*-1;
          }
        } else {
          this.translate.get(["error.noAvailableBalance", "type.error"]).subscribe(
            (res) => {
              this.toastr.error(Object.values(res)[0] as string, Object.values(res)[1] as string);
            }
          );
          this.balanceToBeTransfered = null
          this.bufferBalanceAfterTransferToOU = this.toOu?.bufferBalance
          this.bufferBalanceAfterTransfer = this.fromOu?.bufferBalance;
          this.exchangeBalanceAfterTransfer = this.fromOu?.currentBalance
        }
      } else {
        this.translate.get(["info.enterValue", "type.warning"]).subscribe(
          (res) => {
            this.toastr.warning(Object.values(res)[0] as string, Object.values(res)[1] as string);
          }
        );
        this.bufferBalanceAfterTransferToOU = this.toOu?.bufferBalance
        this.bufferBalanceAfterTransfer = this.fromOu?.bufferBalance;
        this.exchangeBalanceAfterTransfer = this.fromOu?.currentBalance
      }
    }
  }

  showNextStep(type: TransferType): void {
    if (type === 'from' && this.fromOu) {
      this.stepperComponent.next();
      this.selectedStep = 1;
      this.nodeToBeDimmed = this.fromOu
    } else if (type === 'to' && this.toOu) {
      this.stepperComponent.next();
      this.selectedStep = 2;
    }
  }

  showPreviousStep(): void {
    this.stepperComponent.previous();
  }

  handleSuccessResponse(msg: string) {
    this.router.navigate(["/corporate/home"]);
    this.toastr.success(msg);
  }
}
