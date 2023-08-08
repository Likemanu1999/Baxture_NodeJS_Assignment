import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { crons } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";


@Component({
  selector: 'app-cron-trigger',
  templateUrl: './cron-trigger.component.html',
  styleUrls: ['./cron-trigger.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService]
})
export class CronTriggerComponent implements OnInit {
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to send?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
  });
  page_title: any = "Trigger Whatsapp CRON";
  purchaseCron: any[];
  inventory: any[];
  dispatchCron: any[];
  constructor(private crudServices: CrudServices, private toasterService: ToasterService) { }

  ngOnInit() {
    this.getCrons()
  }

  getCrons() {
    this.purchaseCron = [{ name: 'Material Arrival Cron', link: crons.arrivalReport }, { name: 'Local Purchase Monthly', link: crons.localPurchaseMonthly }, { name: 'Local Purchase Daily', link: crons.localPurchaseDaily }];
    this.inventory = [{ name: 'CSP Report', link: crons.cspReport }, { name: 'CSP Report Monthly', link: crons.cspReportMonthly }, { name: 'Unsold SPIPL', link: crons.unsoldSpipl }, { name: 'Unsold PE/PP', link: crons.unsoldPEPP }, { name: 'Unsold Surisha', link: crons.unsoldSurisha }, { name: 'Unsold SPIPL Release', link: crons.unsoldPVCRelease }, { name: 'Unsold PE/PP Release', link: crons.unsoldPEPPRelease }, { name: 'Unsold PVC Release Godown-Grade wise', link: crons.unsoldPVCReleaseGodownWise }]
    this.dispatchCron = [{name:'Sales Dispatch Daily' , link:crons.salesDispatchReportDaily},{name:'Sales Dispatch Monthly',link:crons.salesDispatchReportMonthly}]
  }

  onSubmit(link) {
    this.crudServices.postRequest<any>(link, {}).subscribe(response => {
      this.toasterService.pop('success', 'success', 'Whastapp Sent');
    })

  }

}
