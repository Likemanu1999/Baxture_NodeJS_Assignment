import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { forexReports, MainGrade } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-unsold-summary-import-local',
  templateUrl: './unsold-summary-import-local.component.html',
  styleUrls: ['./unsold-summary-import-local.component.scss'],
  providers: [CrudServices, ToasterService, LoginService]
})
export class UnsoldSummaryImportLocalComponent implements OnInit {

  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;
  @ViewChild('screenDet', { static: false }) screenDet: ElementRef;
  @ViewChild('canvasDet', { static: false }) canvasDet: ElementRef;
  @ViewChild('downloadLinkDet', { static: false }) downloadLinkDet: ElementRef;

  data = {};
  Detaildata = [];
  detailView = false;
  detailView_unsold = false;
  main_grade = [{ id: 0, name: 'All' }];

  isLoading: boolean = false;
  isLoading_unsold: boolean = false;
  port_name = '';
  main_godown_id_Set: any;
  gradeDetails: any;
  grade_name_model: any;
  hold_qty: any;
  set_hold_grade_id: any;
  main_grade_ids: string[];

  all_godown_lc_not_issue = 0;
  all_godown_non_pending = 0;
  all_godown_reg_arrival = 0;
  all_godown_bond_arrival = 0;
  all_godown_stock_transfer_intransite = 0;
  all_godown_stock_transfer_intransite_import = 0;
  all_godown_stock_transfer_intransite_local = 0;
  all_godown_local_purchase = 0;
  all_godown_godwon_stock = 0;
  all_godown_godwon_stock_import = 0;
  all_godown_godwon_stock_local = 0;
  all_godown_sales_pending = 0;
  all_godown_sales_pending_import = 0;
  all_godown_sales_pending_local = 0;



  one_godown_all_grade_lc_not_issue = 0;
  one_godown_all_grade_non_pending = 0;
  one_godown_all_grade_reg_arrival = 0;
  one_godown_all_grade_bond_arrival = 0;
  one_godown_all_grade_stock_transfer_intransite = 0;
  one_godown_all_grade_local_purchase = 0;
  one_godown_all_grade_godwon_stock = 0;
  one_godown_all_grade_sales_pending = 0;
  //ImgView : boolean = true;
  todayDate = Date.now();

  user: UserDetails;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });


  constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private loginService: LoginService) {

    this.user = this.loginService.getUserDetails();
    console.log(this.user.userDet[0].role_id, this.user.userDet[0].company_master.product_masters, "this.user")

    let productsArr = this.user.userDet[0].company_master.product_masters;
    console.log(Object.values(productsArr), "DEBUG_VIEW")

    var productIds = productsArr.map(function (e) {
      return e.id;
    }).filter(function (e, i, a) {
      return a.indexOf(e) === i;
    });
    console.log(productIds, "productIds");

    if (this.user.userDet[0].role_id == 1) {
      //all product
      this.getUnsoldList();
    } else {
      //spipl
      this.CrudServices.postRequest<any>(MainGrade.getMutipleMainGrade, {
        products_ids: productIds
      }).subscribe((response) => {
        console.log(Object.values(response), "multiple");
        var mainGradeIds = response.map(function (e) {
          return e.id;
        }).filter(function (e, i, a) {
          return a.indexOf(e) === i;
        });
        this.main_grade_ids = mainGradeIds;
        this.getUnsoldList();
      });
    }
  }

  ngOnInit() {
    this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe((response) => {
      console.log(response, "main_grade");
      this.main_grade = [...this.main_grade, ...response];
      console.log(this.main_grade, "this.main_grade");
    });
    //this.getUnsoldList();

    // this.CrudServices.postRequest<any>(forexReports.getUnsoldSummaryImportLocal,{
    // 	main_grade_id_array: this.main_grade_ids
    // }).subscribe((response)=>{
    // 	console.log(response,"importLocal")
    // });

  }

  getUnsoldList() {

    this.isLoading_unsold = true;

    this.CrudServices.postRequest<any>(forexReports.getUnsoldSummaryImportLocal, {
      main_grade_id_array: this.main_grade_ids
    }).subscribe((response) => {
      console.log(response, "unsold");
      this.data = response;

      this.all_godown_lc_not_issue = 0;
      this.all_godown_non_pending = 0;
      this.all_godown_reg_arrival = 0;
      this.all_godown_bond_arrival = 0;
      this.all_godown_stock_transfer_intransite = 0;
      this.all_godown_stock_transfer_intransite_import = 0;
      this.all_godown_stock_transfer_intransite_local = 0;
      this.all_godown_local_purchase = 0;
      this.all_godown_godwon_stock = 0;
      this.all_godown_godwon_stock_import = 0;
      this.all_godown_godwon_stock_local = 0;
      this.all_godown_sales_pending = 0;
      this.all_godown_sales_pending_import = 0;
      this.all_godown_sales_pending_local = 0;

      for (let elem of response.port_wise_details) {
        this.all_godown_lc_not_issue = this.all_godown_lc_not_issue + elem.lc_not_issue;
        this.all_godown_non_pending = this.all_godown_non_pending + elem.non_pending;
        this.all_godown_reg_arrival = this.all_godown_reg_arrival + elem.reg_arrival;
        this.all_godown_bond_arrival = this.all_godown_bond_arrival + elem.bond_arrival;
        this.all_godown_stock_transfer_intransite = this.all_godown_stock_transfer_intransite + elem.stock_transfer_intransite;
        this.all_godown_stock_transfer_intransite_import = this.all_godown_stock_transfer_intransite_import + elem.stock_transfer_intransite_import;
        this.all_godown_stock_transfer_intransite_local = this.all_godown_stock_transfer_intransite_local + elem.stock_transfer_intransite_local;
        this.all_godown_local_purchase = this.all_godown_local_purchase + elem.local_purchase;
        this.all_godown_godwon_stock = this.all_godown_godwon_stock + elem.godwon_stock;
        this.all_godown_godwon_stock_import = this.all_godown_godwon_stock_import + elem.godwon_stock_import;
        this.all_godown_godwon_stock_local = this.all_godown_godwon_stock_local + elem.godwon_stock_local;
        this.all_godown_sales_pending = this.all_godown_sales_pending + elem.sales_pending;
        this.all_godown_sales_pending_import = this.all_godown_sales_pending_import + elem.sales_pending_import;
        this.all_godown_sales_pending_local = this.all_godown_sales_pending_local + elem.sales_pending_local;
      }

      this.isLoading_unsold = false;
      this.detailView_unsold = true;


    });
  }

  onSelectMainGrade() {
    this.detailView = false;
    // this.main_grade_ids =$e;
    console.log(this.main_grade_ids);
    this.getUnsoldList();


  }

  downloadImage() { }
  downloadImageDet() { }


}
