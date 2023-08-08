import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationNameMasterComponent } from './notification-name-master.component';

describe('NotificationNameMasterComponent', () => {
  let component: NotificationNameMasterComponent;
  let fixture: ComponentFixture<NotificationNameMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationNameMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationNameMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
