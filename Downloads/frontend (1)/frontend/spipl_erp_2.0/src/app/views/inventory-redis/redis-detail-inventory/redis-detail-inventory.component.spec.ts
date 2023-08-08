import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisDetailInventoryComponent } from './redis-detail-inventory.component';

describe('RedisDetailInventoryComponent', () => {
  let component: RedisDetailInventoryComponent;
  let fixture: ComponentFixture<RedisDetailInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisDetailInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisDetailInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
