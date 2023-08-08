interface NavAttributes {
  [propName: string]: any;
}
interface NavWrapper {
  attributes: NavAttributes;
  element: string;
}
interface NavBadge {
  text: string;
  variant: string;
}
interface NavLabel {
  class?: string;
  variant: string;
}

export interface NavData {
  name?: string;
  url?: string;
  icon?: string;
  badge?: NavBadge;
  title?: boolean;
  children?: NavData[];
  variant?: string;
  attributes?: NavAttributes;
  divider?: boolean;
  class?: string;
  label?: NavLabel;
  wrapper?: NavWrapper;
}

export const navItems: NavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
    badge: {
      variant: 'info',
      text: 'NEW'
    },
  },
  {
    name: 'Masters',
    url: '/masters',
    icon: 'icon-list',
    children: [
      {
        name: 'Role Master',
        url: '/masters/role-master',
        icon: 'icon-user'
      },
     /*  {
        name: 'Dropdowns',
        url: '/buttons/dropdowns',
        icon: 'icon-cursor'
      },
      {
        name: 'Brand Buttons',
        url: '/buttons/brand-buttons',
        icon: 'icon-cursor'
      } */
    ]
  },
  {
    name: 'HR',
    url: '/hr',
    icon: 'icon-list',
    children: [
      {
        name: 'Add Staff',
        url: '/hr/add-staff',
        icon: 'icon-user'
      },
      {
        name: 'List of Staff',
        url: '/hr/list-staff',
        icon: 'icon-people'
      },
    ]
  },

];
