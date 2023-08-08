import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPendingLinksComponent } from './sales-pending-links.component';

describe('SalesPendingLinksComponent', () => {
  let component: SalesPendingLinksComponent;
  let fixture: ComponentFixture<SalesPendingLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesPendingLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPendingLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
