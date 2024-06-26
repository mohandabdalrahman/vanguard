import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: "app-input-field",
  templateUrl: "./input-field.component.html",
  styleUrls: ["./input-field.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputFieldComponent,
    },
  ],
})
export class InputFieldComponent implements ControlValueAccessor {
  @ViewChild("input") input: ElementRef;
  @Output() change = new EventEmitter();
  disabled;

  @Input() type = "text";
  @Input() required: boolean = false;
  @Input() pattern: string = null;
  @Input() label: string = null;
  @Input() placeholder: string = "";
  @Input() errorMsg: string;
  @Input() disable: boolean;
  @Input() ref: any;
  @Input() maxLength: number;
  @Input() minLength: number;
  @Input() size: "sm" | "md" | "lg";
  @Input() inputName: string;
  @Input() max: number;
  @Input() showPercentage = false;
  @Input() display = "block";
  @Input() neglectNum: string;

  // @ts-ignore
  onChange(value) {
    // console.dir(event);
    this.change.emit(value);
  }

  onTouched() {
  }

  writeValue(obj: any): void {
    if (this.input?.nativeElement) {
      if (`${obj}`.split('.')[1]?.length > 2 && typeof obj === 'number') {
        // get first 2 decimal only
        obj = `${obj}`.split('.')[0] + '.' + `${obj}`.split('.')[1].slice(0, 2);
      }
      this.input.nativeElement.value = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onKeyDown(event) {
    if (event?.target.attributes.type.value == "number") {
      const invalidChars = ["-", "+", "e", "E", " ", "Tab", "Delete", "Home", "End", "Enter", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock", "ScrollLock", "Insert"]
      if (this.neglectNum && event.target?.value?.length == 0) {
        invalidChars.push(this.neglectNum);
      }
      if (invalidChars.includes(event.key)) {
        event.preventDefault();
      }
    }
  }

  onKeyUp(event) {
    if (event?.target.attributes.type.value == "number" && this.max === 100) {
      if (event.target.value > 100) {
        event.target.value = 100;
      }
    }
    if (event?.target.attributes?.type?.value == "number") {
      if (event.target?.value?.split('.')[1]?.length > 2) {
        // get first 2 decimal only
        event.target.value = event.target.value.split('.')[0] + '.' + event.target.value.split('.')[1].slice(0, 2);
      }
    }
  }
}
