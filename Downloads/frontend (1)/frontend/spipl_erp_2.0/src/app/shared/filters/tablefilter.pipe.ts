import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tableFilter'
})
export class TableFilterPipe implements PipeTransform {

  // transform(array: any[], query: string, propName: any[]): any {
  //   if (query) {
  
  //     for (const item of propName) {
  //       const val = _.filter(array, row => (row[item].toString().toLowerCase()).indexOf(query) > -1);
  //       if (val.length > 0) {
  //        return val;
  //       }
  //     }
  //     return null;
  //   }
  //   return array;
  // }

  transform(values: any[], filter: string): any {
    if (!values || !values.length) { return []; }
    if (!filter) { return values; }

    filter = filter.toUpperCase();

    if (filter && Array.isArray(values)) {
      const keys = Object.keys(values[0]);
      return values.filter(v => v && keys.some(k => v[k] && v[k].toString().toUpperCase().indexOf(filter) >= 0));
    }
  }
}
