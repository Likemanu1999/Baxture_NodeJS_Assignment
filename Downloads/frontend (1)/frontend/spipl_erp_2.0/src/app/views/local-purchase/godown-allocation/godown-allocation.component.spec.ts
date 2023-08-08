import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GodownAllocationComponent } from './godown-allocation.component';

describe('GodownAllocationComponent', () => {
  let component: GodownAllocationComponent;
  let fixture: ComponentFixture<GodownAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GodownAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GodownAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
