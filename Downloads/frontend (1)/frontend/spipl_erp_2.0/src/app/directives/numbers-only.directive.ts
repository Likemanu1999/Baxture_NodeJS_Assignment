import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'input[numbersOnly]'
})
export class NumberDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;

    //We Have add "." for allow decimal point inside input field if any thing
    //goes wrong or result not ass per Expectetion  please remove '.' from reg expression
    this._el.nativeElement.value = initalValue.replace(/[^0-9 . ,]*/g, '').trim();
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
