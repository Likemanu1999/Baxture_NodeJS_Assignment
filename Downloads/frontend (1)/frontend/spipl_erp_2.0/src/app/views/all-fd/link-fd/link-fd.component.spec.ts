import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkFdComponent } from './link-fd.component';

describe('LinkFdComponent', () => {
  let component: LinkFdComponent;
  let fixture: ComponentFixture<LinkFdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkFdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkFdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
