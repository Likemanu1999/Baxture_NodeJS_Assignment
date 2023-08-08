import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsMastersComponent } from './notifications-masters.component';

describe('NotificationsMastersComponent', () => {
  let component: NotificationsMastersComponent;
  let fixture: ComponentFixture<NotificationsMastersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsMastersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsMastersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
