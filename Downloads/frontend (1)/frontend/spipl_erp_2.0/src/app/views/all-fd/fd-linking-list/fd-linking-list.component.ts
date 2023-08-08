import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FdLinking } from '../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-fd-linking-list',
  templateUrl: './fd-linking-list.component.html',
  styleUrls: ['./fd-linking-list.component.scss'],
  providers: [PermissionService, ExportService, DatePipe , CrudServices],
  encapsulation: ViewEncapsulation.None
})
export class FdLinkingListComponent implements OnInit {
  cols: { field: string; header: string; }[];
  isLoading: boolean = false;
  allFDs: any = [];
  globalList: any = [];

  constructor(
    private crudServices : CrudServices) {
    this.cols = [
      { field: 'fdNo', header: 'FD Number' },
      { field: 'fdAmount', header: 'FD Amount' },
      { field: 'currency', header: 'Currency' },
      { field: 'currency_rate', header: 'Currency Rate' },
      { field: 'currency_type_amount', header: 'original Invoice Amount' },
      { field: 'bexInvoice', header: 'Bex Invoice' },
      { field: 'nonInvoice', header: 'Non Invoice' },
      { field: 'nonLcInvoice', header: 'Non Lc Invoice' },
      { field: 'lcInvoice', header: 'Lc Invoice' },
      { field: 'ilcInvoice', header: 'Ilc Invoice' },
      { field: 'totalAmount', header: 'Total Amount' },

    ]
   }

  ngOnInit() {
    this.getAllList();
  }

  getAllList() {
    this.isLoading = true;
    this.crudServices.getAll<any>(FdLinking.fdLinkingList).subscribe(response => {
      this.isLoading = false;
     this.allFDs = response ;
     this.globalList = response;


    })
  }

  onTypeCheck(event) {

    if(event) {
      const type = event.target.value;
      if(type == 1) {
        this.allFDs = this.globalList.filter(
          fd => fd.letter_of_credit_id !== null || fd.inland_letter_of_credit_id !== null );
      } else if(type == 2) {
        this.allFDs = this.globalList.filter(
          fd => fd.letter_of_credit_id === null && fd.inland_letter_of_credit_id === null );
      } else {
        this.allFDs = this.globalList;
      }
      }
    }



}
