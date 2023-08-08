
import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'datefilter'
  })

  export class DateFilterPipe implements PipeTransform {
    transform(values: any[], fromdate, todate, col): any {
      if (!values || !values.length) { return []; }
      if (!fromdate && !todate) { return values; }
      if (fromdate !== undefined && todate !== undefined  && Array.isArray(values)) {
        const date1 = new Date(fromdate);
        const date2 = new Date(todate);
        return values.filter(data => new Date(data[col]) >= date1 && new Date(data[col]) <= date2);
      }
    }
  }





