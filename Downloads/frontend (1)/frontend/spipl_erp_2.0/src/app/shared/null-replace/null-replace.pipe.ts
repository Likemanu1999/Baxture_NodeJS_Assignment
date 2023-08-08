import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullReplace'
})
export class NullReplacePipe implements PipeTransform {

  transform(value: any): any {
    if(value === null) {
      return "";
    }  else 

    if(value === undefined) {
      return "";
    } else {
      return value;
    }
   
  }

}
