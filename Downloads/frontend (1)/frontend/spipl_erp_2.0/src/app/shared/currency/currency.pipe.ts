import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyInr'
})
export class InrCurrencyPipe implements PipeTransform {

  // transform(x: any, ...args: any[]): any {
  //  if (typeof x === 'number') {
  //     x = String(x);
  //   }
  //   let lastThree = String(x).substr(x.length - 3);
  //   const otherNumbers = String(x).substring(0, x.length - 3);
  //   if (otherNumbers !== '') {
  //       lastThree = ',' + lastThree;
  //   }
  //   const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  //  return res;
  // }


    //Resolve . Point Problem (Like 174,.125  will Show like 147.125 )
    transform(x: any, ...args: any[]): any {
   if (typeof x === 'number') {
      x = String(x);
    }
    let result = String(x).toString().split('.');
    let lastThree = result[0].substring(result[0].length - 3);
    const otherNumbers = result[0].substring(0, result[0].length - 3);
    if (otherNumbers != '')
    lastThree = ',' + lastThree;
    var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    if (result.length > 1) {
        output += "." + result[1].substring(0,2);
    }
   return output;
  }

}


