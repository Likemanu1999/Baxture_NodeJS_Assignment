
import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DatePipe } from '@angular/common';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { newHoliday } from '../../../shared/apis-path/apis-path';
import { FullCalendarModule } from 'primeng/fullcalendar';

@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe, CrudServices],

})
export class HolidayCalendarComponent implements OnInit {

  options: { plugins: import("@fullcalendar/core/plugin-system").PluginDef[]; defaultDate: string; header: { left: string; center: string; right: string; }; editable: boolean; };

  events = [];
  data = [];

  constructor(public datePipe: DatePipe, private crudServices: CrudServices) {

  }


  ngOnInit() {


    this.options = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      defaultDate: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      header: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,


    };
    this.getData();

  }


  getData() {
    this.crudServices.getRequest<any>(newHoliday.getAll).subscribe(response => {
      this.data = response.data;



      for (let val of this.data) {
        let end_date = val.end_date;
        let date = new Date(val.end_date)
        if (date) {
          date.setDate(date.getDate() + 1);
          var d = new Date(date);
          end_date = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
        }

        this.events.push({
          "title": val.new_holiday_type.name,
          "start": val.date,
          "end": val.end_date,
          "backgroundColor": "Green",

        })
      }





    })


  }



}

