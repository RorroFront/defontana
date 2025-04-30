import { AfterViewInit, Component, OnInit, signal, ViewChild, } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../Services/character.service';
import { Character, CharacterEntries } from '../../Interfaces/character';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { catchError, Observable, of, pipe, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { CardComponent } from "../../carddetail/card/card.component";
import { toObservable } from '@angular/core/rxjs-interop';
import { Episodes } from '../../Interfaces/episodes';




@Component({
  selector: 'app-table',
  imports: [MatTableModule, MatPaginatorModule, MatSelectModule,
    MatInputModule, MatFormFieldModule, FormsModule, MatIconModule, CommonModule, MatCardModule, CardComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit, AfterViewInit {

  constructor(private characterService: CharacterService) { }
  private pageChange$ = new Subject<number>();
  private destroy$ = new Subject();

  selectedCharacterName = signal<string | null>(null);
  characterName$ = toObservable(this.selectedCharacterName);

  selectedCharacterImage = signal<string | null>(null);
  characterImage$ = toObservable(this.selectedCharacterImage);

  selectedCharacterLocation = signal<string | null>(null);
  characterLocation$ = toObservable(this.selectedCharacterLocation);

  selectedEpisodeName = signal<string | null>(null);
  episodeName$ = toObservable(this.selectedEpisodeName);

  filterNameCoincidences = signal<string[] | null>(null);
  characterNameCoincidences$ = toObservable(this.filterNameCoincidences);

  selectedOriginCoincidence = signal<string[] | null>(null);
  characterOriginCoincidence$ = toObservable(this.selectedOriginCoincidence)

  originPlace = signal<string | null>(null);
  characterBirthPlace$ = toObservable(this.originPlace)



  characterData: Character[] = [];
  displayedColumns: string[] = [
    'name', 'status', 'species',
    'type', 'gender', 'created'
  ];

  speciesCount!:Record<string, number>;
  typeCount!:Record<string, number>;
  sameOriginCharacters: Character[] = [];
  origin: string = ''
  population: string[] = [];
  residentsArr: string[] = [];
  locationMatches: Character[] = [];
  selectedLocation: string = '';
  episodeIndex: number = 1;
  characterID: number = 1;
  dataSource = new MatTableDataSource<Character>(this.characterData);
  name: string = '';
  status: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  noFilterMatch: boolean = false;
  totalItems: number = 0;
  pageSize: number = 20;

  @ViewChild(MatPaginator) paginator!: MatPaginator;



  ngOnInit(): void {


    this.allCharacters();
    this.pageChange$.next(this.currentPage);



  }

  //METODO PRINCIPAL POPULA LA TABLA Y MANEJA
  //SWITCHMAP PARA NO ALMACENAR SUSCRIPCIONES, Y DESUSCRBIRSE
  allCharacters() {
    this.pageChange$
      .pipe(
        takeUntil(this.destroy$),
        // tap((page) =>
        //   console.log(`Nueva página o filtros cambiados, pagina ${page}`+ `\n` + `nombre del personaje ${this.name}, estatus ${this.status}`)
        // ),
        switchMap((page) => {
          const hasFilters = this.name.trim() || this.status.trim();
          const filters = {
            name: this.name.trim() || undefined,
            status: this.status.trim() || undefined,
          };
          return hasFilters
            ? this.characterService.getCharactersFilter(filters, page)
            : this.characterService.getAllCharacters(page);
        }),
        catchError((err) => {
          console.error('Error en la solicitud:', err);

          if (err?.status === 404) {
            this.noFilterMatch = true;
            this.totalPages = 1;
            return of({ results: [], info: { pages: 1 } });
          }

          this.noFilterMatch = false;
          return of({ results: [], info: { pages: 1 } });
        })
      )
      .subscribe((res) => {
        this.dataSource.data = res.results;
        this.characterData = res.results;
        this.totalPages = res.info.pages;
        this.noFilterMatch = res.results.length === 0;
        this.population = res.results.map((item) => item.url);




      });
  }

  //FILTRO PARA LOCACION
  locationsFilter(locationName: string) {
    const filters = { name: locationName };

    this.characterService.getLocationFilter(filters).subscribe({
      next: (res) => {
        this.residentsArr = res.results[0]?.residents || [];

        const matchedUrls = this.population.filter(url => this.residentsArr.includes(url));

        // console.log('URLs coincidentes:', matchedUrls);

        this.locationMatches = this.characterData.filter(character =>
          matchedUrls.includes(character.url)
        );

        this.filterNameCoincidences.set(this.locationMatches.map(item => item.name))

        // console.log('Personajes que coinciden:', characterNameCoincidences);
      },
      error: (err) => {
        console.error('Error al filtrar ubicación por nombre:', err);
      }
    });
  }

  //DETALLE DEL CHARACTER
  characterDetail() {
    return this.characterService.getCharacterDetail(this.characterID)
      .subscribe({
        next: ((res) => {
          this.dataSource.data.find(item => item.id == this.characterID)
          // console.log('personaje filtrado', this.dataSource.data.find(item => item.id == this.characterID))
        }),
        error: ((err) => console.error('Error inesperado', err))

      });
  }

  //DETALLE DEL EPISODIO
  characterEpisodeDetail() {
    return this.characterService.getEpisodeDetail(this.episodeIndex)
      .subscribe({
        next: ((res) => {
          this.selectedEpisodeName.set(res.name)
          // console.log(this.selectedEpisodeName())
        }),
        error: ((err) => console.error('Error inesperado', err))
      });
  }

  //PAGINADOR AL FINAL
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  };

  //DESUSCRIBO AL DESTRUIR COMPONENTE
  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }


  //EVENTO PARA CLICK DESDE EL TEMPLATE
  onCharacterNameClick(character: Character,) {

    //LOGICA PARA LOCATION
    this.selectedLocation = character.location.name;
    if (!this.selectedLocation || this.selectedLocation === 'unknown') return;
    this.locationsFilter(this.selectedLocation);


    //LOGICA PARA EL CHARACTER.ORIGIN
    this.origin = character.origin.name;
    this.dataSource.data.forEach((item) => item.origin.name);
    this.sameOriginCharacters = this.dataSource.data.filter(item =>
    item.origin.name === this.origin);
    this.selectedOriginCoincidence.set(this.sameOriginCharacters.map((item) => item.name));
    this.originPlace.set(character.origin.name);
    // console.log(this.originPlace())



    //LOGICA PARA DATOS DE CHARACTER
    this.selectedCharacterName.set(character.name);
    this.selectedCharacterImage.set(character.image);
    this.selectedCharacterLocation.set(character.location.name)
    // console.log(this.selectedCharacterName());
    this.characterID = character.id;
    this.characterDetail(); //LEO VALOR OBSERVABLE
    this.checkEpisode(character)//LLAMO A METODO CHECKEPISODE;

    let typeCount = this.dataSource.data.reduce((counter: Record<string, number>, character) => {
      counter[character.type] = (counter[character.type] || 0) + 1;
      return counter;
    }, {});

    this.typeCount = typeCount;

    let speciesCount = this.dataSource.data.reduce((counter: Record<string, number>, character) => {
      counter[character.species] = (counter[character.species] || 0) + 1;
      return counter;
    }, {});
    this.speciesCount = speciesCount




  }


  //LOGICA PARA EPISODE
  checkEpisode(character: Character) {
    const firstEpisodeUrl = character.episode[0];

    if (firstEpisodeUrl) {
      this.episodeIndex = +firstEpisodeUrl.split('/').pop()!;

      this.characterEpisodeDetail();//INICIO EL METODO PARA SUSCRIPCION
    }
  }




  //CON ESTO LEO CAMBIOS EN OBSERVABLE
  loadCharacters(): void {
    this.pageChange$.next(this.currentPage);
  }


  //FILTRO PARA EL MAT-SELECT
  nameStatusFilter() {

    this.currentPage = 1;
    this.pageChange$.next(this.currentPage);
    if (this.name.trim() == '' && this.status.trim() == '') {
      this.allCharacters();
      this.currentPage = 1;
      this.pageChange$.next(this.currentPage);
    }

  }


  //LIMPIO LOS FILTROS
  clearFilters(): void {
    this.allCharacters();//REINICIO LA SUSCRIPCION
    this.name = '';
    this.status = '';
    this.currentPage = 1;
    this.pageChange$.next(this.currentPage);
    this.noFilterMatch = false;
  }



  //PAGINACION+1
  nextCharacterSet(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCharacters();
      this.allCharacters();
      if (this.paginator) {
        this.paginator.firstPage();
      }
    }
  }


  //PAGINACION-1
  prevCharacterSet() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCharacters();
      this.allCharacters();
      if (this.paginator) {
        this.paginator.firstPage();
      }
    }
  }


}














