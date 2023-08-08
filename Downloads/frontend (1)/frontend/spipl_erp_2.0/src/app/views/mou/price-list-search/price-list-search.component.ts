import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PriceList } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-price-list-search',
  templateUrl: './price-list-search.component.html',
  styleUrls: ['./price-list-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ExportService,
    CrudServices
  ]
})


export class PriceListSearchComponent implements OnInit {

  latest_all_arr = staticValues.price_list_period;


  manufacture_arr = [];
  city_arr = [];
  grade_arr = [];
  searchResult = [];

  manufacture: any;
  latest_all: any;
  city_ids: any;
  grade_ids: any;
  cols: any[];

  filteredValuess: any;
  isLoading: boolean = false;

  constructor(private CrudService: CrudServices,
    private exportService: ExportService) {

    this.cols = [
      { field: 'change_date', header: 'Date' },
      { field: 'manufactureName', header: 'Manufacture' },
      { field: 'cityName', header: 'City' },
      { field: 'gradeName', header: 'Grade' },
      { field: 'mfi', header: 'MFI' },
      { field: 'gradeCategory', header: 'Grade Category' },
      // { field: 'freight_rate', header: 'Freight' },
      { field: 'net_value_sales', header: 'Price' }
    ];

    this.latest_all = 1;
    this.CrudService.getRequest<any>(PriceList.getManufactureFromPrice).subscribe((response) => {
      this.manufacture_arr = response;
    });

    this.CrudService.getRequest<any>(PriceList.getCityFromPrice).subscribe((response) => {
      this.city_arr = response;
    });

    this.CrudService.getRequest<any>(PriceList.getGradeFromPrice).subscribe((response) => {
      this.grade_arr = response;
    });



  }

  ngOnInit() {



  }

  onSearch() {
    this.CrudService.postRequest<any>(PriceList.priceListSearch, {
      manu_org_id: this.manufacture,
      city_id: this.city_ids,
      grade_id: this.grade_ids,
      latest_all: this.latest_all,

    }).subscribe((response) => {
      this.searchResult = response;

      this.searchResult.map(item => {
        item.manufactureName = item.main_org_master.org_name;
        item.cityName = item.city_master.name;
        item.gradeName = item.grade_master.grade_name;
        item.gradeCategory = item.grade_master.grade_category ? item.grade_master.grade_category.grade_category : null;


      });


    });

  }

  onFilter(event, dt) {
    this.filteredValuess = event.filteredValue;
  }

  onClear(control_name) {
    this[control_name] = undefined;
  }


}
