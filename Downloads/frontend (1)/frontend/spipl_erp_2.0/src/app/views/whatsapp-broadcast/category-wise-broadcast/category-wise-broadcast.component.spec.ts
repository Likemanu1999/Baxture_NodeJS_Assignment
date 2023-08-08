import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryWiseBroadcastComponent } from './category-wise-broadcast.component';

describe('CategoryWiseBroadcastComponent', () => {
  let component: CategoryWiseBroadcastComponent;
  let fixture: ComponentFixture<CategoryWiseBroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryWiseBroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryWiseBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
