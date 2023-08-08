import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { staticValues } from "../../../shared/common-service/common-service";
import { WhatsappService } from '../whatsapp.service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { OrganizationCategory, WhatsappBroadcastZonewize } from '../../../shared/apis-path/apis-path';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ModalDirective } from "ngx-bootstrap";

@Component({
  selector: 'app-whatsapp-broadcast-zonewize',
  templateUrl: './whatsapp-broadcast-zonewize.component.html',
  styleUrls: ['./whatsapp-broadcast-zonewize.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, WhatsappService, LoginService],
})
export class WhatsappBroadcastZonewizeComponent implements OnInit {
  data: any = [];
  private toasterService: ToasterService;
  id: number;
  add_opt: boolean = false;
  numbers: any = []
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  isLoading: boolean = false;
  showed: boolean = false;
  user: UserDetails;
  userId: any;
  body: any;
  categories: any;
  zoneArr: any = []
  cols: any = [];
  filter: any = [];
  zoneData: any;
  filteruser: any;
  whatsappMsgs: any = [
    {
      id: 0,
      name: "STANDARD",
      video_url: "https://spipl-release.s3.ap-south-1.amazonaws.com/plast-india-2023/Parmar-Expo+Invitation+02.mp4"
    },
    {
      id: 1,
      name: "VVIP",
      video_url: "https://spipl-release.s3.ap-south-1.amazonaws.com/plast-india-2023/Parmar-VIP+Invite.mp4"
    },
  ];
  constructor(toasterService: ToasterService, private whatsapp: WhatsappService, private permissionService: PermissionService, private loginService: LoginService, private CrudServices: CrudServices) {
    this.user = this.loginService.getUserDetails();
    this.userId = this.user.userDet[0].id;
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
  }
  ngOnInit() {
    this.getData()
  }
  getData() {
    this.CrudServices.getAll<any>(OrganizationCategory.getAll).subscribe((response) => {
      this.categories = response;
    });
  }
  onchange(e) {
    for (let index = 0; index < e.length; index++) {
      var data = e[index].id
    }
    this.zoneArr.push(data)
  }
  submit() {
    this.CrudServices.getOne<any>(WhatsappBroadcastZonewize.getZoneWize, this.zoneArr).subscribe((response) => {
      this.categories = response;
      for (let index = 0; index < response.data.length; index++) {
        this.numbers.push(response.data[index].contact_no)

      }
      this.zoneData = response.data.length
    });
    this.isLoading = true;
  }
  submit2() {
    this.body = [{
      "template_name": "plast_india_2223_combine",
      "locale": "en",
      "numbers": this.numbers,
      "params": [],
      "id": this.filteruser[0].id,
      "video_url": this.filteruser[0].video_url,
      "name": this.filteruser[0].name
    }]
    this.CrudServices.getOne<any>(WhatsappBroadcastZonewize.sendWhatsappVideo, this.body).subscribe((response) => {
      // 
    })

  }
  onchange2(e) {
    this.filteruser = this.whatsappMsgs.filter(item => item.id == e.id)

  }
}

