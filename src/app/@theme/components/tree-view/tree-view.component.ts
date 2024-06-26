import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrentLangService } from '@shared/services/current-lang.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit {

  @Input() nodes: any;
  @Output() onNodeSelected = new EventEmitter<any>();
  nodeWidth=337;
  currentLang: string;
  private subs = new SubSink();
  options = {
    rtl: false
  };
  prevELementId:string

  constructor(private translate: TranslateService,
    private currentLangService: CurrentLangService,) { }
 

  ngOnInit(): void {
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.options.rtl = lang !== 'en';
        this.currentLang = lang;
      }),
    );

  }
  selectNode(treeNode: any) {

    if (this.prevELementId) {
      const element = document.getElementById(this.prevELementId);
      element.classList.remove('branchClick')
    } 
    this.prevELementId = treeNode.id
    const element = document.getElementById(treeNode.id);
    element.classList.add('branchClick')

    this.onNodeSelected.emit(treeNode);
  }

 
}
