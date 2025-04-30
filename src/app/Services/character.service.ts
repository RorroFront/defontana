import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Character, CharacterEntries } from '../Interfaces/character';
import { Episodes } from '../Interfaces/episodes';
import { LocationEntries } from '../Interfaces/locations';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor() { }

  private baseUrl: string = 'https://rickandmortyapi.com/api';
  private http = inject(HttpClient);
  nextUrl: string = ''
  prevUrl: string = ''

  getAllCharacters(page: number): Observable<CharacterEntries> {
    const url = `${this.baseUrl}/character/`;

    return this.http.get<CharacterEntries>(url, { params: { page } })
      .pipe(
        catchError(err => {
          return throwError(() => err.error?.message || 'Error desconocido durante la solicitud')
        }
        )
      )
  };


  getCharactersFilter(filters: { name?: string, status?: string, species?: string, type?: string, gender?: string }, page: number): Observable<CharacterEntries> {

    const url = `${this.baseUrl}/character/`;
    const { name, status, species, type, gender } = filters;

    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (status) params = params.set('status', status);
    if (species) params = params.set('species', species);
    if (type) params = params.set('type', type);
    if (gender) params = params.set('gender', gender);
    params = params.set('page', page);

    return this.http.get<CharacterEntries>(url, { params })
      .pipe(
        catchError(err => {
          return throwError(() => ({
            status: err.status,
            message: err.status === 404
              ? 'Personaje no encontrado'
              : 'Error al obtener el Personaje'
          }));
        })
      )

  }


    getLocationFilter(filters: { name?: string, type?: string, dimension?:string }):Observable<LocationEntries>{
      const url =` ${this.baseUrl}/location`;
      const { name, type, dimension, } = filters;

      let params = new HttpParams();
      if (name) params = params.set('name', name);
      if (type) params = params.set('type', type);
      if (dimension) params = params.set('dimension', dimension);


      return this.http.get<LocationEntries>(url, {params})
    }




  getCharacterDetail(id: number): Observable<CharacterEntries> {
    const url = `${this.baseUrl}/character/`;

    return this.http.get<CharacterEntries>(url, { params: { id } })
      .pipe(
        catchError(err => {
          return throwError(() => err.error?.message || 'Error desconocido durante la solicitud')
        })
      )

  }

  getEpisodeDetail(id: number): Observable<Episodes> {
    const url = `${this.baseUrl}/episode/${id}`;

    return this.http.get<Episodes>(url)
      .pipe(
        catchError(err => {
          return throwError(() => ({
            status: err.status,
            message: err.status === 404
              ? 'Episodio no encontrado'
              : 'Error al obtener el episodio'
          }));
        })
      );




  }






}



