import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeCategoryComponent } from './grade-category.component';

describe('GradeCategoryComponent', () => {
  let component: GradeCategoryComponent;
  let fixture: ComponentFixture<GradeCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradeCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
