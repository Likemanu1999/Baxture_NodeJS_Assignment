import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisBdInventoryNewComponent } from './redis-bd-inventory-new.component';

describe('RedisBdInventoryNewComponent', () => {
  let component: RedisBdInventoryNewComponent;
  let fixture: ComponentFixture<RedisBdInventoryNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisBdInventoryNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisBdInventoryNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
