import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralInventoryLocalComponent } from './central-inventory-local.component';

describe('CentralInventoryLocalComponent', () => {
  let component: CentralInventoryLocalComponent;
  let fixture: ComponentFixture<CentralInventoryLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralInventoryLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralInventoryLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
