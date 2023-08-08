import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealOffersComponent } from './deal-offers.component';

describe('DealOffersComponent', () => {
  let component: DealOffersComponent;
  let fixture: ComponentFixture<DealOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
