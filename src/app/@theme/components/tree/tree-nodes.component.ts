import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {TreeComponent, TreeNode} from "@circlon/angular-tree-component";
import {TranslateService} from "@ngx-translate/core";
import {SubSink} from "subsink";
import {CurrentLangService} from "@shared/services/current-lang.service";

@Component({
  selector: 'app-tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class TreeNodesComponent implements OnInit, AfterViewInit,OnChanges {
  private subs = new SubSink();
  @ViewChild('tree') treeComponent: TreeComponent;
  @Output() onNodeSelected = new EventEmitter<any>();
  @Input() nodes: any;
  @Input() colorOptions:{parentBgColor:string,childBgColor:string , parentColor:string,childColor:string}={parentBgColor:'#fff',childBgColor:'#fff',childColor:'#000',parentColor:'#000'};
  @Input() showOuBalanceDetails: boolean;
  @Input() nodeToBeDimmed: any;
  prevId:string
  options = {
    rtl: false,
  };
  currentLang: string;

  showMenu = false;
  showDrawer = false;

  constructor(
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private eRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.options.rtl = this.currentLangService.getCurrentLang() !== 'en';
    
    this.subs.add(
      this.translate.onLangChange.subscribe(({lang}) => {
        this.options.rtl = lang !== 'en';
        this.currentLang = lang;
      }),
    );

  }

  ngOnChanges(changes: any) {
    if (changes?.nodes?.currentValue) {
      this.nodes = changes?.nodes?.currentValue;
    }
  }

  ngAfterViewInit() {
    // if (this?.treeComponent?.treeModel) {
    //   this?.treeComponent?.treeModel?.expandAll();
    // }
    // const treeModel: TreeModel = this.treeComponent.treeModel;
    // firstNode.setActiveAndVisible();
    setTimeout(() => {
      this.expandFirstNode();
    }, 1000);
  }

  // expand first node
  expandFirstNode() {
    const firstNode: TreeNode = this?.treeComponent?.treeModel?.getFirstRoot();
    firstNode?.expand();
  }

    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent): void {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.showMenu = false;
        this.showDrawer = !this.showDrawer;
      }
    }


  selectNode(treeNode: any) {
    // console.log("show ou balance details: " + this.showOuBalanceDetails);
    // console.log(treeNode);
    if(this.showOuBalanceDetails){
      if( (this.nodeToBeDimmed == treeNode.node?.data) || treeNode.node?.data && treeNode.node?.data?.inputBalanceDistributionMode  &&  treeNode.node?.data?.inputBalanceDistributionMode === 'BY_LIMIT'){
        // console.log("first condition ... emitting null");
        this.onNodeSelected.emit(null);
        return
      }
        if (treeNode.eventName === 'activate') {
          // console.log("activating ... emitting node.data");
          this.onNodeSelected.emit(treeNode?.node?.data);
        } else {
          // console.log("deactivating ... emitting null");
          this.onNodeSelected.emit(null);
        }

    } else {
      if (treeNode.eventName === 'activate') {
        this.onNodeSelected.emit(treeNode?.node?.data);
      } else {
        this.onNodeSelected.emit(null);
      }
    }
    // console.log(this.onNodeSelected);

  }

  handleShowDetails() {
    this.showMenu = !this.showMenu;
    this.showDrawer = true;
  }
  onSelect(node: any){
    this.expandFirstNode()
    if(node.id==this.prevId){
      node.showDrawer=!node.showDrawer
      node.alwaysShowDetails=!node.alwaysShowDetails
      return
    }
    if(this.prevId){
      const element=document.getElementById(this.prevId) as HTMLElement
      element.classList.add('d-none')
    }
    const element=document.getElementById(node.id) as HTMLElement

    if(element.classList.contains('d-none')){
      element.classList.remove('d-none')
      node.showDrawer = true;
      node.alwaysShowDetails = true;
      this.prevId=node.id;

      return
    }else {
      node.showDrawer = true;
      node.alwaysShowDetails = true;
      this.prevId=node.id;

      return
    }
  
  }
}

