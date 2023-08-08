import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronTriggerComponent } from './cron-trigger.component';

describe('CronTriggerComponent', () => {
  let component: CronTriggerComponent;
  let fixture: ComponentFixture<CronTriggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronTriggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
