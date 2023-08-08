import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalCollectionComponent } from './local-collection.component';

describe('LocalCollectionComponent', () => {
  let component: LocalCollectionComponent;
  let fixture: ComponentFixture<LocalCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
