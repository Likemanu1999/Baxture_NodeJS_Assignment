import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneWiseStockComponent } from './zone-wise-stock.component';

describe('ZoneWiseStockComponent', () => {
  let component: ZoneWiseStockComponent;
  let fixture: ComponentFixture<ZoneWiseStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneWiseStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneWiseStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
