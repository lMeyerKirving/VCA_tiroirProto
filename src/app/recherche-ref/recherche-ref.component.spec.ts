import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheRefComponent } from './recherche-ref.component';

describe('RechercheRefComponent', () => {
  let component: RechercheRefComponent;
  let fixture: ComponentFixture<RechercheRefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechercheRefComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechercheRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
