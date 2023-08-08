import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { allFD, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-fd-editore',
  templateUrl: './fd-editore.component.html',
  providers: [CrudServices, AmountToWordPipe, DatePipe],
  styleUrls: ['./fd-editore.component.css']
})
export class FdEditoreComponent implements OnInit {

  @ViewChild('myEditor', { static: false }) myEditor: any;
  myContent: string;
  ckeConfig: any;
  fdIndexes: any;
  fdsData: any;
  bankId: any;
  fd_status: any;
  fdsArr: any[] = [];
  fdObj: any;
  converted: any;
  fd_ids: any[] = [];
  allFds: any = [];
  isFdIdsArrFlag: boolean;
  singleFdId: any;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private crudServices: CrudServices, private amountToWord: AmountToWordPipe, private datePipe: DatePipe) {
    this.ckeConfig = {
      'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
    };
  }

  ngOnInit() {
    this.fd_status = this.activeRoute.snapshot.queryParams['fd_status'];
    if (this.fd_status === 'creation') {
      this.checkFdIdsStrArrOrNot();
      this.fdCreation();
    } else if (this.fd_status === 'liquidation') {
      this.checkFdIdsStrArrOrNot();
      this.fdLiquidation();
    } else if (this.fd_status === 'renew') {
      this.checkFdIdsStrArrOrNot();
      this.fdRenew();
    }
  }
  checkFdIdsStrArrOrNot() {
    if (Array.isArray(this.activeRoute.snapshot.queryParams['fd_ids'])) {
      this.isFdIdsArrFlag = true;
      this.fd_ids = this.activeRoute.snapshot.queryParams['fd_ids'];
    } else {
      this.isFdIdsArrFlag = false;
      this.singleFdId = this.activeRoute.snapshot.queryParams['fd_ids'];
    }
  }

  fdCreation() {
    if (Object.keys(window.history.state).length > 1) {
      this.fdsData = window.history.state;
      this.fdIndexes = Object.keys(this.fdsData);
      let fdDetailsStr = "";
      for (const key in this.fdsData) {
        if (key !== 'navigationId') {
          this.bankId = this.fdsData[key].spipl_bank_id;
          let fd_mount = this.amountToWord.transform(Number(this.fdsData[key].fd_amt));

          const fdReleaseDate = moment(this.fdsData[key].fd_make_date);
          const fdMakingDate = moment(this.fdsData[key].fd_maturity_date);

          const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));

          fdDetailsStr = fdDetailsStr + `ONE FD of Rs. ${this.fdsData[key].fd_amt}=00 (${fd_mount}) for the period of   ${this.datePipe.transform(this.fdsData[key].fd_make_date, 'dd/MM/yyyy')} to  ${this.datePipe.transform(this.fdsData[key].fd_maturity_date, 'dd/MM/yyyy')}  (${noOfDays} days)`;
          fdDetailsStr = fdDetailsStr + '<br>';
          // this.fdsArr.push(fdObj);
        }
      }
      this.fdObj = {
        fd_make_dt: moment(new Date()).format('L'),
        fd_details: fdDetailsStr
      }
      this.getTemplate(this.bankId, 'fd_creation_template');
    } else {
      // this.fdService.getFdsByFdIds(this.fd_ids)
      this.crudServices.getOne<any>(allFD.getAll, {}).subscribe(res => {
        this.allFds = res;
        let fdDetailsStr = "";
        this.allFds.forEach(fd => {
          this.bankId = fd.spipl_bank_id;
          if (this.isFdIdsArrFlag) {
            this.fd_ids.forEach(id => {
              if (fd.id === parseInt(id)) {
                let fd_mount = this.amountToWord.transform(Number(fd.fd_amt));
                const fdReleaseDate = moment(fd.fd_make_date);
                const fdMakingDate = moment(fd.fd_maturity_date);

                const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));
                fdDetailsStr = fdDetailsStr + `ONE FD of Rs. ${fd.fd_amt}=00 (${fd_mount}) for the period of  ${this.datePipe.transform(fd.fd_make_date, 'dd/MM/yyyy')} to ${this.datePipe.transform(fd.fd_maturity_date, 'dd/MM/yyyy')} (${noOfDays} days)`;
                fdDetailsStr = fdDetailsStr + '<br>';
              }
            })
          } else {
            if (fd.id === parseInt(this.singleFdId)) {
              let fd_mount = this.amountToWord.transform(Number(fd.fd_amt));
              const fdReleaseDate = moment(fd.fd_make_date);
              const fdMakingDate = moment(fd.fd_maturity_date);

              const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));
              fdDetailsStr = fdDetailsStr + `ONE FD of Rs. ${fd.fd_amt}=00 ( ${fd_mount}) for the period of  ${this.datePipe.transform(fd.fd_make_date, 'dd/MM/yyyy')} to ${this.datePipe.transform(fd.fd_maturity_date, 'dd/MM/yyyy')}  (${noOfDays} days)`;
              fdDetailsStr = fdDetailsStr + '<br>';
            }
          }

        })
        this.fdObj = {
          fd_make_dt: moment(new Date()).format('L'),
          fd_details: fdDetailsStr
        }
        this.getTemplate(this.bankId, 'fd_creation_template');
      })

    }
  }

  fdLiquidation() {
    if (Object.keys(window.history.state).length > 1) {
      this.fdsData = window.history.state;
      this.fdIndexes = Object.keys(this.fdsData);
      let fdDetailsStr = "";
      for (const key in this.fdsData) {
        if (key !== 'navigationId') {
          this.bankId = this.fdsData[key].spipl_bank_id;

          fdDetailsStr = fdDetailsStr + `FD No. ${this.fdsData[key].fd_no}  Dtd: ${moment(this.fdsData[key].fd_make_date).format('L')}, Amt: Rs. ${this.fdsData[key].fd_amt}=00 `;
          fdDetailsStr = fdDetailsStr + '<br>';
          // this.fdsArr.push(fdObj);
        }
      }
      this.fdObj = {
        fd_release_dt: moment(new Date()).format('L'),
        fd_details: fdDetailsStr
      }
      this.getTemplate(this.bankId, 'fd_liquidation_template');
    } else {

      this.crudServices.getOne<any>(allFD.getAll, {}).subscribe(res => {
        this.allFds = res;
        let fdDetailsStr = "";
        this.allFds.forEach(fd => {
          this.bankId = fd.spipl_bank_id;
          this.fd_ids.forEach(id => {
            if (fd.id === parseInt(id)) {
              fdDetailsStr = fdDetailsStr + `FD No. ${fd.fd_no}  Dtd: ${moment(fd.fd_make_date).format('L')}, Amt: Rs. ${fd.fd_amt}=00 `;
              fdDetailsStr = fdDetailsStr + '<br>';
            }
          })
        })
        this.fdObj = {
          fd_release_dt: moment(new Date()).format('L'),
          fd_details: fdDetailsStr
        }
        this.getTemplate(this.bankId, 'fd_liquidation_template');
      })
    }
  }

  fdRenew() {
    if (Object.keys(window.history.state).length > 1) {
      this.fdsData = window.history.state;
      this.fdIndexes = Object.keys(this.fdsData);
      let fdDetailsStr = "";
      for (const key in this.fdsData) {
        if (key !== 'navigationId') {
          this.bankId = this.fdsData[key].spipl_bank_id;

          fdDetailsStr = fdDetailsStr + `FD No# ${this.fdsData[key].fd_no}, Rs. ${this.fdsData[key].fd_amt}=00
                                        Kindly renew the above FD till ${this.fdsData[key].fd_maturity_date}  (i.e Tenure of FD will be for ${this.fdsData[key].fd_in_days} days)`;
          fdDetailsStr = fdDetailsStr + '<br>';
          // this.fdsArr.push(fdObj);
        }
      }
      this.fdObj = {
        fd_renew_dt: moment(new Date()).format('L'),
        fd_details: fdDetailsStr
      }
      this.getTemplate(this.bankId, 'fd_renew_template');
    } else {
      this.crudServices.getOne<any>(allFD.getAll, {}).subscribe(res => {
        this.allFds = res;
        let fdDetailsStr = "";
        this.allFds.forEach(fd => {
          this.bankId = fd.spipl_bank_id;
          this.fd_ids.forEach(id => {
            if (fd.fd_id === parseInt(id)) {
              fdDetailsStr = fdDetailsStr + `FD No# ${fd.fd_no}, Rs. ${fd.fd_amt}=00
                                        Kindly renew the above FD till ${fd.fd_maturity_date}  (i.e Tenure of FD will be for ${fd.fd_in_days} days)`;
              fdDetailsStr = fdDetailsStr + '<br>';
            }
          })
        })
        this.fdObj = {
          fd_renew_dt: moment(new Date()).format('L'),
          fd_details: fdDetailsStr
        }
        this.getTemplate(this.bankId, 'fd_renew_template');
      })
    }
  }


  download() {
    const newstr = this.myContent;
    let html_document = '<!DOCTYPE html><html><head><title></title>';
    html_document += '</head><body>' + newstr + '</body></html>';
    this.converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
    saveAs(this.converted, 'FD Application-MT.docx');
  }
  getTemplate(bank_id, template_type) {
    this.crudServices.getOne<any>(SpiplBankMaster.getOne, { id: bank_id }).subscribe((response) => {
      this.myContent = response[0][template_type];
      /*  for (const key in this.fdObj) {
         this.myContent = this.myContent.replace(new RegExp('{' + key + '}', 'g'), this.fdObj[key]);
       } */


      this.replaceStr();

    });
  }

  replaceStr() {
    // let fdDetailsStr = "";
    // this.fdsArr.forEach(fd => {
    //   for (const key in fd) {
    //     this.myContent = this.myContent.replace(new RegExp('{' + key + '}', 'g'), fd[key]);
    //   }
    // });
    for (const key in this.fdObj) {
      this.myContent = this.myContent.replace(new RegExp('{' + key + '}', 'g'), this.fdObj[key]);
    }

  }

  onBack() {
    this.router.navigate(['fd/all-fds']);
  }

}
