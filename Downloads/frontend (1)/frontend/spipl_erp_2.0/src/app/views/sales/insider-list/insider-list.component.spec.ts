import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsiderListComponent } from './insider-list.component';

describe('InsiderListComponent', () => {
  let component: InsiderListComponent;
  let fixture: ComponentFixture<InsiderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsiderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsiderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
