import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SubSink } from "subsink";
import { TranslateService } from "@ngx-translate/core";
import { CurrentLangService } from "@shared/services/current-lang.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent implements OnInit {
  private subs = new SubSink();
  @Input() totalElements: number;
  @Input() pageSizes = [10, 25, 50, 100];
  @Input() currentPage: number;
  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();
  maxSize = 5;
  currentLang: string;
  pageSize = 10;

  constructor(
    private translate: TranslateService,
    private currentLangService: CurrentLangService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params.page || 1;
      this.pageSize = +params.pageSize || 10;
    })
    this.currentLang = this.currentLangService.getCurrentLang();
    this.subs.add(
      this.translate.onLangChange.subscribe(({ lang }) => {
        this.currentLang = lang;
      })
    );
  }

  pageChange(page: number) {
    this.onPageChange.emit(page);
  }

  handlePageSizeChange(event) {
    this.onPageSizeChange.emit(event.target.value);
    // this.maxSize = Math.floor(this.totalElements / +event.target.value);
    this.pageSize = +event.target.value;
  }
}
