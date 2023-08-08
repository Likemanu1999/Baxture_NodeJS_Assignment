import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralRedisInventoryLocalComponent } from './central-redis-inventory-local.component';

describe('CentralRedisInventoryLocalComponent', () => {
  let component: CentralRedisInventoryLocalComponent;
  let fixture: ComponentFixture<CentralRedisInventoryLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralRedisInventoryLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralRedisInventoryLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
