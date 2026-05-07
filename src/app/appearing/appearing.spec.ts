import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Appearing } from './appearing';

describe('Appearing', () => {
  let component: Appearing;
  let fixture: ComponentFixture<Appearing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Appearing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Appearing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
