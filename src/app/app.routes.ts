import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RechercheRefComponent } from './recherche-ref/recherche-ref.component';
import {SessionGuard} from './guards/session.guard';

export const routes: Routes = [
  {
    path: '',
    component: RechercheRefComponent,
    canActivate: [SessionGuard], // Ajout du Guard ici
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
