import { Component } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { FormsModule } from '@angular/forms';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { style } from '@angular/animations';

@Component({
  selector: 'app-recherche-ref',
  standalone: true,
  templateUrl: './recherche-ref.component.html',
  styleUrls: ['./recherche-ref.component.css'],
  imports: [FormsModule, NgIf, NgForOf, NgClass, NgSwitchCase, NgSwitchDefault, NgSwitch]
})
export class RechercheRefComponent {
  searchTerm: string = '';
  result: any = null;
  noResults: boolean = false;

  // Session / config
  sessionID: string | null = null;
  baseURL: string | null = null;
  serv: string | null = null;

  // Sélections
  selectedSegment: string = '';
  selectedLevel: string = '';
  selectedUser: string = '';

  // Sélections distinctes pour Fabricant et Fonction
  selectedFabricant: string = '';
  selectedFonction: string = '';

  // Données
  segments: any[] = [];
  levels: any[] = [];
  users: any[] = [];

  // Fabricants et Fonctions séparés
  fabricants: any[] = [];
  fonctions: any[] = [];

  filteredLevels: any[] = [];
  filteredUsers: any[] = [];

  pageTitle: string = '';
  type: string = "Coffre Prototype";

  isLoading: boolean = false;
  isDisconnected: boolean = false;
  hasSearched: boolean = false;
  resultCount: number = 0;

  // Pop-up
  attachments: any[] = [];
  showModal: boolean = false;



  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    this.baseURL = `${urlObject.origin}/`;
    this.serv = `${urlObject.origin}`;
    this.backendService.audrosServer = this.baseURL;

    this.route.queryParamMap.subscribe((params) => {
      this.sessionID = params.get('AUSessionID');
      console.log('SessionID :', this.sessionID);

      if (this.sessionID) {
        // Connexion
        this.backendService.log(this.sessionID).subscribe({
          next: (response) => console.log('Connexion réussie :', response),
          error: (err) => console.error('Erreur de connexion :', err),
        });
      }
    });

    this.loadPageTitle();

    // Chargement des données
    this.loadSegments();
    this.loadPilier();
    this.loadCollection();

    // On sépare Fabricant et Fonction
    this.loadFabricant();
    this.loadFonction();
  }

  // ----------- Chargement des data depuis le backend -----------
  loadPageTitle(): void {
    if (this.type) {
      this.backendService.getName(this.type).subscribe({
        next: (response) => {
          const data = response.data?.[0];
          this.pageTitle = data?.titre || '';
          this.titleService.setTitle(this.pageTitle || 'Van Cleef & Arpels - Recherche');
        },
        error: (err) => {
          console.error('Erreur lors du chargement du titre :', err);
          this.pageTitle = 'Something went wrong';
          this.titleService.setTitle(this.pageTitle);
        },
      });
    } else {
      console.error('Type non défini');
      this.pageTitle = 'Titre not provided';
      this.titleService.setTitle(this.pageTitle);
    }
  }

  loadSegments(): void {
    this.backendService.getSegment().subscribe({
      next: (response) => {
        this.segments = response.data?.map((segment: { segment: string; num_art: string }) => ({
          ...segment,
          segment: segment.segment,
          num_art: segment.num_art,
        })) || [];
      },
      error: (err) => console.error('Erreur Segments :', err),
    });
  }

  loadPilier(): void {
    this.backendService.getPilier().subscribe({
      next: (response) => {
        this.levels = response.data?.map((level: { ref_utilisat: string; num_art: string }) => ({
          ...level,
          ref_utilisat: level.ref_utilisat,
          num_art: level.num_art
        })) || [];
      },
      error: (err) => console.error('Erreur Pilier :', err)
    });
  }

  loadCollection(): void {
    this.backendService.getCollection().subscribe({
      next: (response) => {
        this.users = response.data?.map((user: { niveau: string; num_art: string }) => ({
          ...user,
          niveau: user.niveau,
          num_art: user.num_art
        })) || [];
      },
      error: (err) => console.error('Erreur Collection :', err)
    });
  }

  loadFabricant(): void {
    this.backendService.getFabricant().subscribe({
      next: (response) => {
        // On stocke la liste des Fabricants
        this.fabricants = response.data?.map((fab: { role: string; num_art: string }) => ({
          ...fab,
          role: fab.role,
          num_art: fab.num_art
        })) || [];
      },
      error: (err) => console.error('Erreur Fabricant :', err),
    });
  }

  loadFonction(): void {
    this.backendService.getFonction("").subscribe({
      next: (response) => {
        // On stocke la liste des Fonctions
        this.fonctions = response.data?.map((f: { role: string; num_art: string }) => ({
          ...f,
          role: f.role,
          num_art: f.num_art
        })) || [];
      },
      error: (err) => console.error('Erreur Fonction :', err),
    });
  }

  // ----------- Filtres dépendants -----------
  onSegmentChange(): void {
    if (this.selectedSegment) {
      this.filteredLevels = this.levels.filter(l => l.segment === this.selectedSegment);
      this.selectedLevel = '';
      this.filteredUsers = [];
      this.selectedUser = '';
    } else {
      this.filteredLevels = [];
      this.selectedLevel = '';
      this.filteredUsers = [];
      this.selectedUser = '';
    }
  }

  onLevelChange(): void {
    if (this.selectedLevel) {
      this.filteredUsers = this.users.filter(u => u.niveau.toLowerCase() === this.selectedLevel.toLowerCase());
      this.selectedUser = '';
    } else {
      this.filteredUsers = [];
      this.selectedUser = '';
    }
  }

  // ----------- Recherche -----------
  onSearch(): void {
    this.isLoading = true;
    this.hasSearched = true;

    // Récupérer num_art ou "0"
    const selectedSegmentNumArt = this.segments.find(s => s.segment === this.selectedSegment)?.num_art || '0';
    const selectedLevelNumArt   = this.levels.find(l => l.ref_utilisat === this.selectedLevel)?.num_art || '0';
    const selectedUserNumArt    = this.users.find(u => u.ref_utilisat === this.selectedUser)?.num_art || '0';

    // Fabricant et Fonction
    const selectedFabricantNumArt = this.fabricants.find(f => f.role === this.selectedFabricant)?.num_art || '0';
    const selectedFonctionNumArt  = this.fonctions.find(f => f.role === this.selectedFonction)?.num_art || '0';

    // Construction des paramètres
    // On met FAB pour Fabricant, FCT pour Fonction
    const searchParameters = [
      `VCA:${this.searchTerm || ''}`,      // Référence VCA
      `SEG:${selectedSegmentNumArt}`,
      `PIL:${selectedLevelNumArt}`,
      `COL:${selectedUserNumArt}`,
      `FAB:${selectedFabricantNumArt}`,
      `FCT:${selectedFonctionNumArt}`,
      `TYPE:${this.type || ''}`
    ].join(';');


    console.log('Paramètres de recherche :', searchParameters);

    this.backendService.getObjectByRef(searchParameters, this.serv).subscribe({
      next: (response) => {
        console.log('Réponse du backend :', response);

        const documents = response.data || [];
        this.noResults = documents.length === 0;

        if (!this.noResults) {
          this.result = {
            ref_utilisat: documents.map((doc: any) => ({
              ref_utilisat: doc.ref_utilisat,
              designation: doc.designation,
              urlPicture: doc.urlPicture,
              url: doc.url,
              fabricant: doc.Fabricant,
              tiroir: doc.Tiroir,

              /* Nouveaux champs */
              okShooting: doc.okShooting.toLowerCase(),
              okIndus: doc.okIndus.toLowerCase(),
              isValid: doc.isValid,
              phaseProjet: doc.phaseProjet,
              materiau: doc.materiau,
              refPF: doc.refPF,
              statutPF: doc.statutPF,
            }))
            ,
          };
        } else {
          this.result = null;
        }
        this.resultCount = this.result?.ref_utilisat?.length || 0;
      },
      error: (err) => {
        if (err.status === 200) {
          this.isDisconnected = true;
        } else {
          console.error('Erreur applicative :', err);
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // ----------- Popup attachements -----------
  pageSize = 9;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.attachments.length / this.pageSize);
  }

  get paginatedAttachments(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.attachments.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

// Quand on ouvre la pop-up
  openProto(doc: any): void {
    if (!doc?.ref_utilisat) {
      return;
    }
    this.isLoading = true;

    this.backendService.getAttachment(doc.ref_utilisat, this.serv).subscribe({
      next: (response) => {
        console.log('Attachements reçus :', response);

        // "response.data" est déjà un tableau
        const docs = response.data || [];

        // On mappe chaque objet vers la structure de "attachments"
        this.attachments = docs.map((d: any) => ({
          file_name: d.file_name,
          urlPicture: d.urlPicture,
          url: d.url
        }));

        // Ouvrir la pop-up et réinitialiser la page
        this.showModal = true;
        this.currentPage = 1;
      },
      error: (err) => console.error('Erreur getAttachment :', err),
      complete: () => {
        this.isLoading = false;
      }
    });
  }


// Fermer la pop-up
  closeModal(): void {
    this.showModal = false;
    this.attachments = [];
  }

// Ouvrir l'attachment
  openAttachment(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  // ----------- Divers -----------
  redirectToLogin(): void {
    window.location.href = `${this.serv}/apps/aud-portal-app/`;
  }

  resetFields(): void {
    this.searchTerm = '';
    this.selectedSegment = '';
    this.selectedLevel = '';
    this.selectedUser = '';
    this.selectedFabricant = '';
    this.selectedFonction = '';
    this.result = null;
    this.resultCount = 0;
    this.noResults = false;
    this.hasSearched = false;
  }

  protected readonly Math = Math;
}
