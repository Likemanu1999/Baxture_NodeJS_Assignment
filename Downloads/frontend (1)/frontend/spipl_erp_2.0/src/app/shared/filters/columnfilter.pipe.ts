import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'columnFilter'
  })

  export class ColumnFilterPipe implements PipeTransform {
    transform(values: any[], columnName, filter): any {
    
        if (!values || !values.length) { return []; }
        if (!filter) { return values; }
        const filterArray = [];

        if (filter && filter !== undefined  && Array.isArray(values)) {
          for (let i = 0 ; i < values.length ; i++) {
           if (values[i][columnName].toString() === filter.toString()) {
            filterArray.push(values[i]);

           }
          }
          return filterArray;
        }
      }
  }


