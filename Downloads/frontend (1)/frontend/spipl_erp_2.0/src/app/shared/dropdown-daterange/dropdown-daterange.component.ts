import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from "moment";
import {  staticValues } from '../../shared/common-service/common-service';

@Component({
  selector: 'app-dropdown-daterange',
  templateUrl: './dropdown-daterange.component.html',
  styleUrls: ['./dropdown-daterange.component.scss']
})
export class DropdownDaterangeComponent implements OnInit {

  date_range_arr = staticValues.date_range_arr;
  selectedRange: any;
  date_range: any;
  @Output() dateEvent = new EventEmitter<any>();
  @Input() uploadSuccess: EventEmitter<boolean>;
  selected: any;
  constructor() {    
  }

  ngOnInit() {
    if (this.uploadSuccess) {      
      this.uploadSuccess.subscribe(data => {
        if(!data && this.selected != 'Current Month'){
          this.selectedRange = null;
        }
      });
    }
  }

  selectDate(action : any) {
    this.selected = action.value.range;
    var monthEnd: any;
    var monthStart: any;
    let yearEnd: any;
    switch (action.value.id) {
      case 1:
        this.date_range = [
          new Date(moment().endOf('month').format("YYYY-MM-DD")),
          new Date(moment().startOf('month').format("YYYY-MM-DD"))
        ];
        break;

      case 2:
        monthStart = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
        monthEnd = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        this.date_range = [
          new Date(monthStart),
          new Date(monthEnd)
        ];
        break;

      case 3:
        monthStart = moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD');
        monthEnd = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        this.date_range = [
          new Date(monthStart),
          new Date(monthEnd)
        ];
        break;

      case 4:
        monthStart = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
        monthEnd = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        this.date_range = [
          new Date(monthStart),
          new Date(monthEnd)
        ];
        break;

      case 5:
        monthStart = moment().subtract(6, 'months').startOf('month').format('YYYY-MM-DD')
        monthEnd = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        this.date_range = [
          new Date(monthStart),
          new Date(monthEnd)
        ];
        break;

      case 6:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(2, 'months').startOf('month').format('YYYY-MM-DD')),
          yearEnd
        ];
        break;

      case 7:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(1, 'years').startOf('month').format('YYYY-04-01')),
          yearEnd
        ];
        break;

      case 8:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(1, 'years').format('YYYY-04-01')),//1st April
          new Date(moment(yearEnd).subtract(1, 'years').add(3, 'months').endOf('month').format('YYYY-MM-DD')), //30 June
        ];
        break;

      case 9:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(1, 'years').add(4, 'months').startOf('month').format('YYYY-MM-DD')), //1st July
          new Date(moment(yearEnd).subtract(1, 'years').add(6, 'months').endOf('month').format('YYYY-MM-DD'))  //30 Sept
        ];
        break;

      case 10:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(1, 'years').add(7, 'months').startOf('month').format('YYYY-MM-DD')), //1st Oct
          new Date(moment(yearEnd).subtract(1, 'years').add(9, 'months').endOf('month').format('YYYY-MM-DD'))  //30 Dec
        ];
        break;

      case 11:
        yearEnd = new Date(moment().format('YYYY-03-31'));
        this.date_range = [
          new Date(moment(yearEnd).subtract(1, 'years').add(10, 'months').startOf('month').format('YYYY-MM-DD')), //1st Jan
          yearEnd  //31 March
        ];
        break;
      default:
          break
    }
    this.dateEvent.emit({'range' : this.date_range })

  }

}
