  import { Component } from '@angular/core';
  import { BackendService } from '../services/backend.service';
  import { FormsModule } from '@angular/forms';
  import {NgClass, NgForOf, NgIf} from '@angular/common';
  import { ActivatedRoute, Router } from '@angular/router';
  import { Title } from '@angular/platform-browser';


  @Component({
    selector: 'app-recherche-ref',
    standalone: true,
    templateUrl: './recherche-ref.component.html',
    styleUrls: ['./recherche-ref.component.css'],
    imports: [
      FormsModule,
      NgIf,
      NgForOf,
      NgClass
    ]
  })
  export class RechercheRefComponent {

    searchTerm: string = ''; // Contient la référence utilisateur saisie
    result: any = null; // Résultat obtenu après recherche
    noResults: boolean = false; // Indique si aucun résultat n'a été trouvé
    sessionID: string | null = null;
    baseURL: string | null = null;
    serv: string | null = null;

    selectedFunction: string = '';

    constructor(private backendService: BackendService, private route: ActivatedRoute, private router: Router,  private titleService: Title) {}

    levels: any[] = []; // Liste des Levels
    users: any[] = []; // Liste des Users
    filteredLevels: any[] = []; // Liste des Levels filtrés selon le Segment sélectionné
    filteredUsers: any[] = []; // Liste des Users filtrés selon le Level sélectionné
    functions: any[] = [];
    segments: any[] = []; // Liste des Segments

    selectedLevel: string = ''; // Niveau sélectionné
    selectedUser: string = ''; // Utilisateur sélectionné
    selectedSegment: string = '';

    pageTitle: string = '';
    type: string | null = null; // Type de l'application

    isLoading: boolean = false;
    isDisconnected: boolean = false;
    hasSearched: boolean = false;

    resultCount: number = 0;




    ngOnInit(): void {
      const currentUrl = window.location.href;
      const urlObject = new URL(currentUrl);

      this.baseURL = `${urlObject.origin}/`;
      this.serv = `${urlObject.origin}`;
      this.backendService.audrosServer = this.baseURL;
      this.route.queryParamMap.subscribe((params) => {
        this.sessionID = params.get('AUSessionID');
        this.type = params.get('type');
        console.log('SessionID :', this.sessionID);

        if (this.sessionID) {
          this.backendService.log(this.sessionID).subscribe({
            next: (response) => console.log('Connexion réussie :', response),
            error: (err) => console.error('Erreur de connexion :', err),
          });
        }
      });
      this.loadPageTitle();
      this.loadLevels();
      this.loadUsers();
      this.loadFunctions();
      this.loadSegments();

    }

    onSearch(): void {
      this.isLoading = true;
      this.hasSearched = true; // L'utilisateur a lancé une recherche
      // Récupérer les num_art pour chaque champ sélectionné ou définir "0" par défaut
      const selectedLevelNumArt = this.levels.find(level => level.ref_utilisat === this.selectedLevel)?.num_art || '0';
      const selectedUserNumArt = this.users.find(user => user.ref_utilisat === this.selectedUser)?.num_art || '0';
      const selectedFunctionNumArt = this.functions.find(func => func.role === this.selectedFunction)?.num_art || '0';
      const selectedSegmentNumArt = this.segments.find(segment => segment.segment === this.selectedSegment)?.num_art || '0';


      // Construire la chaîne avec les champs et leurs num_art ou "0"
      const searchParameters = [
        `VCA:${this.searchTerm || ''}`,    // Référence VCA
        `SEG:${selectedSegmentNumArt}`,
        `PIL:${selectedLevelNumArt}`,      // Pilier (num_art ou "0")
        `COL:${selectedUserNumArt}`,       // Collection (num_art ou "0")
        `FCT:${selectedFunctionNumArt}`,   // Fonction (num_art ou "0")
        `TYPE:${this.type || ''}`          // Ajout du type à la requête
      ].join(';'); // Concaténer avec ';' comme séparateur

      console.log('Paramètres de recherche :', searchParameters);

      // Appel au backend
      this.backendService.getObjectByRef(searchParameters, this.serv).subscribe({
        next: (response) => {
          console.log('Réponse du backend :', response);

          const documents = response.data
            ?.flatMap((item: any) => item.documents) || [];
          this.noResults = documents.length === 0;

          if (!this.noResults) {
            this.result = {
              ref_utilisat: documents.map((doc: any) => ({
                ref_utilisat: doc.ref_utilisat,
                designation: doc.designation,
                urlPicture: doc.urlPicture,
                url: doc.url,
              })),
            };
          } else {
            this.result = null; // Réinitialiser les résultats si aucun document
          }
          this.resultCount = this.result?.ref_utilisat?.length || 0;
          console.log('Résultat formaté :', this.result);
        },
        error: (err) => {
          if (err.status === 200) {
            // ==> le backend est complètement indisponible ou unreachable (il envoie une requette http au lieu d'un json) //TODO : tester les limite de cette methode
            // C’est ici que tu affiches un popup "Serveur indisponible" par exemple
            //alert('Serveur indisponible');
            this.isDisconnected = true;
          } else {
            // Autre type d’erreur (4xx, 5xx, problème de parsing, etc.)
            console.error('Erreur applicative ou autre :', err);
          }
        },
        complete: () => {
          this.isLoading = false; // Fin du chargement
        }
      });
    }



  loadLevels(): void {
    this.backendService.getLevell().subscribe({
      next: (response) => {
        console.log('Levels reçus : ', response);
        this.levels = response.data?.map((level: { ref_utilisat: string; num_art: string }) => ({
          ...level,
          ref_utilisat: level.ref_utilisat, // Normalisation en minuscules
          num_art: level.num_art // Ajout de num_art
        })) || [];
      },
      error: (err) => console.error('Erreur lors du chargement des Levels :', err)
    });
  }

  loadUsers(): void {
    this.backendService.getUsers().subscribe({
      next: (response) => {
        console.log('Users reçus : ', response);
        this.users = response.data?.map((user: { niveau: string; num_art: string }) => ({
          ...user,
          niveau: user.niveau, // Normalisation en minuscules
          num_art: user.num_art // Ajout de num_art
        })) || [];
      },
      error: (err) => console.error('Erreur lors du chargement des Users :', err)
    });
  }

  loadFunctions(): void {
    this.backendService.getFonction().subscribe({
      next: (response) => {
        console.log('Fonctions reçues :', response);
        this.functions = response.data?.map((func: { role: string; num_art: string }) => ({
          ...func,
          role: func.role, // Conserver le rôle
          num_art: func.num_art // Ajout de num_art
        })) || [];
      },
      error: (err) => console.error('Erreur lors du chargement des fonctions :', err),
    });
  }

  loadSegments(): void {
    this.backendService.getSegment().subscribe({
      next: (response) => {
        console.log('Segments reçus :', response);
        this.segments = response.data?.map((segment: {segment: string; num_art: string }) => ({
          ...segment,
          segment: segment.segment,
          num_art: segment.num_art,
        })) || [];
      },
      error: (err) => console.error('Erreur lors du chargement des Segments :', err),
    });
  }

    loadPageTitle(): void {
      if (this.type) { // Vérifie que "type" est défini avant d'appeler le backend
        console.log('Type dans l\'url : ', this.type)
        this.backendService.getName(this.type).subscribe({
          next: (response) => {
            const data = response.data?.[0];
            this.pageTitle = data?.titre || ''; // Utilisation du titre reçu

            // Met à jour le titre de l'onglet du navigateur
            this.titleService.setTitle(this.pageTitle || 'Van Cleef & Arpels - Recherche');
          },
          error: (err) => {
            console.error('Erreur lors du chargement du titre :', err);
            this.pageTitle = 'Something went wrong'; // Valeur par défaut en cas d'erreur
            this.titleService.setTitle(this.pageTitle); // Met à jour le titre avec la valeur par défaut
          },
        });
      } else {
        console.error('Type non défini dans l’URL');
        this.pageTitle = 'Titre not provided'; // Valeur par défaut si aucun type n'est défini
        this.titleService.setTitle(this.pageTitle);
      }
    }



    onSegmentChange(): void {
      console.log('Segment sélectionné : ', this.selectedSegment);

      if (this.selectedSegment) {
        // Filtrer les piliers selon le segment
        this.filteredLevels = this.levels.filter(level => level.segment === this.selectedSegment);
        this.selectedLevel = ''; // Réinitialiser le Pilier à la valeur par défaut
        this.filteredUsers = []; // Réinitialiser les collections
        this.selectedUser = ''; // Réinitialiser la Collection
      } else {
        // Si le segment est désélectionné, réinitialiser tous les champs dépendants
        this.filteredLevels = [];
        this.selectedLevel = ''; // Réinitialiser le Pilier
        this.filteredUsers = [];
        this.selectedUser = ''; // Réinitialiser la Collection
      }
    }


    onLevelChange(): void {
      console.log('Niveau sélectionné : ', this.selectedLevel);

      if (this.selectedLevel) {
        // Filtrer les collections selon le Pilier sélectionné
        this.filteredUsers = this.users.filter(user => user.niveau.toLowerCase() === this.selectedLevel.toLowerCase());
        this.selectedUser = ''; // Réinitialiser la Collection
      } else {
        // Si le Pilier est désélectionné, réinitialiser les collections
        this.filteredUsers = [];
        this.selectedUser = ''; // Réinitialiser la Collection
      }
    }

    redirectToLogin(): void {
      window.location.href = `${this.serv}/apps/aud-portal-app/`;
    }

    resetFields(): void {
      this.searchTerm = '';
      this.selectedSegment = '';
      this.selectedLevel = '';
      this.selectedUser = '';
      this.selectedFunction = '';
      this.result = null;
      this.resultCount = 0;
      this.noResults = false;
      this.hasSearched = false;
    }



  }
