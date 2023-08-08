import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class PermissionService {
add_opt: boolean = false;
edit_opt: boolean = false;
view_opt: boolean = false;
del_opt: boolean = false;
numbers = new Array();
 constructor(private route: ActivatedRoute, private router: Router) {}
  /**
  * This methods gets menus from localstorage and find the current url in menu array if matches assign permissions to currentPermission variable and return.
    Else checks main menu has child menu if present then loop through child menus and check child url is match with current url , if matches assign permissions to current permission variable and return.
  */
 public  getPermission () {
    const data = JSON.parse(localStorage.getItem('menu'));
    let index = -1;
    // const current_route = this.router.url; OLD current url
    const current_route = '/' + this.router.url.split('/')[1] + '/' + this.router.url.split('/')[2];
    let currentPermission = '';
    const filteredObj = data.find(function(item, i) {
      if (item.url === current_route) {
          currentPermission = item.permission;
          index = i;
          return i;
        }
      if (item.hasOwnProperty('children')) {
          const total_child = item.children.length;
          for (let index2 = 0; index2 < item.children.length; index2++) {
          if (item.children[index2].url === current_route) {
            currentPermission = item.children[index2].permission;
            index = i;
            return i;
            }
          }
      }
    });

    this.add_opt = (currentPermission['add_opt'] === 1 ) ? true : false;
    this.view_opt = (currentPermission['view_opt'] === 1 ) ? true : false;
    this.edit_opt = (currentPermission['edit_opt'] === 1 ) ? true : false;
    this.del_opt = (currentPermission['del_opt'] === 1 ) ? true : false;
    this.numbers.push(this.add_opt);
    this.numbers.push(this.view_opt);
    this.numbers.push(this.edit_opt);
    this.numbers.push(this.del_opt);
    return this.numbers;
  }
}
