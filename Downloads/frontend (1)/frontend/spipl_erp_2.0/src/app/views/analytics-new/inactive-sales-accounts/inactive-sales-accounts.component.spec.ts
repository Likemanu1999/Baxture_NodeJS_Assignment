import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveSalesAccountsComponent } from './inactive-sales-accounts.component';

describe('InactiveSalesAccountsComponent', () => {
  let component: InactiveSalesAccountsComponent;
  let fixture: ComponentFixture<InactiveSalesAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactiveSalesAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveSalesAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
