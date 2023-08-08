import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expensecatFilter'
})
export class ExpenseCatFilterPipe implements PipeTransform {

  transform(array: any[], query: string): any {
    if (query) {
      // return _.filter(array, row => row.dept_name.indexOf(query) > -1);
      return _.filter(array, row => (row.category.toLowerCase()).indexOf(query.toLowerCase()) > -1);
    }
    return array;
  }
}
