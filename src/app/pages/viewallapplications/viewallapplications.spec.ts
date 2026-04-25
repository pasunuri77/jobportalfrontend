import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewallapplications } from './viewallapplications';

describe('Viewallapplications', () => {
  let component: Viewallapplications;
  let fixture: ComponentFixture<Viewallapplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewallapplications],
    }).compileComponents();

    fixture = TestBed.createComponent(Viewallapplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
