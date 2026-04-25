import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forgetpassword } from './forgetpassword';

describe('Forgetpassword', () => {
  let component: Forgetpassword;
  let fixture: ComponentFixture<Forgetpassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forgetpassword],
    }).compileComponents();

    fixture = TestBed.createComponent(Forgetpassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
