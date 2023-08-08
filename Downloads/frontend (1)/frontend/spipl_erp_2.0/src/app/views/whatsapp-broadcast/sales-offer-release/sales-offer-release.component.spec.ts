import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOfferReleaseComponent } from './sales-offer-release.component';

describe('SalesOfferReleaseComponent', () => {
  let component: SalesOfferReleaseComponent;
  let fixture: ComponentFixture<SalesOfferReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOfferReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOfferReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
