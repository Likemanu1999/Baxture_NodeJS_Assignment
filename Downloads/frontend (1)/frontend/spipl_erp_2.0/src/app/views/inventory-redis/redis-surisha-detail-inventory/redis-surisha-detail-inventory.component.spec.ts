import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisSurishaDetailInventoryComponent } from './redis-surisha-detail-inventory.component';

describe('RedisSurishaDetailInventoryComponent', () => {
  let component: RedisSurishaDetailInventoryComponent;
  let fixture: ComponentFixture<RedisSurishaDetailInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisSurishaDetailInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisSurishaDetailInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
