import { INavBadge, INavAttributes, INavLabel, INavWrapper, INavLinkProps } from '@coreui/angular/lib/sidebar/app-sidebar-nav';
import { INavData } from '@coreui/angular';
 /**
 * This interface is a blueprint of response getting from server on validate user authentication.
 */
export interface UserDetails {
  userDet: {
  id: number;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: string;
  email: string;
  alter_mobile: string;
  local_address: string;
  permanant_address: string;
  password: string;
  role_id: number;
  dob: string;
  deptartment_id: number;
  profile_photo: string;
  machine_id: number;
  company_master:any;
  };
  menuDet: {
    name?: string;
    url?: string | any[];
    icon?: string;
    children?: INavData[];
    permission?: any;
  };
  links: [];
  iat: number;
  exp: number;
}
