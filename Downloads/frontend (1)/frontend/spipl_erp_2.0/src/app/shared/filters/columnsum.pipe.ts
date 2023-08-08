import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'totalsum'
  })

  export class ColumnSumPipe implements PipeTransform {
    transform(values: any[], columnName): any {
        if (!values || !values.length) { return []; }

        let total = 0;


        if (Array.isArray(values)) {

          for (let i = 0 ; i < values.length ; i++) {
            total = total + values[i][columnName];

          }
          return total;

        }
      }
  }


