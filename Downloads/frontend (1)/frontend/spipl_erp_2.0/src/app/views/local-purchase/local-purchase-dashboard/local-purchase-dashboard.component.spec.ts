import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPurchaseDashboardComponent } from './local-purchase-dashboard.component';

describe('LocalPurchaseDashboardComponent', () => {
  let component: LocalPurchaseDashboardComponent;
  let fixture: ComponentFixture<LocalPurchaseDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalPurchaseDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPurchaseDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
