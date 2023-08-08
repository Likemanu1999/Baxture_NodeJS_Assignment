import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisAllocatedInventoryComponent } from './redis-allocated-inventory.component';

describe('RedisAllocatedInventoryComponent', () => {
  let component: RedisAllocatedInventoryComponent;
  let fixture: ComponentFixture<RedisAllocatedInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisAllocatedInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisAllocatedInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
