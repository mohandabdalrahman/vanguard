import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: StatusComponent,
    },
  ],
})
export class StatusComponent implements ControlValueAccessor {
  @ViewChild("select") select: ElementRef;
  @Input() status = "app.status";
  constructor() {}
  // @ts-ignore
  onChange(event) {}

  // @ts-ignore
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  // @ts-ignore
  registerOnTouched(fn: any): void {
    // throw new Error("Method not implemented.");
  }
  // @ts-ignore
  setDisabledState?(isDisabled: boolean): void {
    // throw new Error("Method not implemented.");
  }

  ngOnInit(): void {}
}
