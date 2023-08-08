import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisBdInventoryComponent } from './redis-bd-inventory.component';

describe('RedisBdInventoryComponent', () => {
  let component: RedisBdInventoryComponent;
  let fixture: ComponentFixture<RedisBdInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisBdInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisBdInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
