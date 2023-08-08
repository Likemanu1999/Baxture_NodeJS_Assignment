import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveInventoryComponent } from './live-inventory.component';

describe('LiveInventoryComponent', () => {
  let component: LiveInventoryComponent;
  let fixture: ComponentFixture<LiveInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
