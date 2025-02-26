import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root', // Ce service sera disponible dans toute l'application
})
export class BackendService {
  public audrosServer = ``;
  private _audrosSession: (string | undefined);
  public user = "audros";
  public psw = "aupwd";
  public Ct = '40';
  public authInfos = 'AUSessionID=';

  private _sessionId = ""
  private _baseUrl: string = '';

  connected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient){

  }

  autologin(): Observable<any> {

    const param = "login";
    const data = "";

    const url = `${this.audrosServer}${this._baseUrl}${param}@${data}@`;

    return new Observable(observer => {
      const url = `${this.audrosServer}cocoon/View/LoginCAD.xml?userName=${this.user}&computerName=AWS&userPassword=${this.psw}&dsn=dmsDS&Client_Type=${this.Ct}`;

      this.http.get(url, {responseType: 'text'}).subscribe({
        next: (response: string) => {
          console.log("XML Response:", response);

          // Parse the XML response using DOMParser
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response, 'application/xml');

          const resultElement = xmlDoc.querySelector('result');

          if (resultElement) {
            this._sessionId = resultElement.textContent || "";
            console.log("Connected with session: ", this._sessionId);
            this.connected.next(true);
            this._baseUrl = `cocoon/View/ExecuteService/fr/AW_AuplResult3.text?${this.authInfos}${this._sessionId}&ServiceSubPackage=mehdi&ServiceName=doc_ctrl.au&ServiceParameters=`;
            console.log("url base est : ", this._baseUrl)


          } else {
            console.error("Autologin failed: Unable to extract session id from XML");
          }
          // Assume successful login if we get here
          observer.next(response); // Emit successful login
          observer.complete(); // Complete the observable
        },
        error: (error) => {
          //console.error("Autologin failed:", error);
          observer.error(error); // Propagate error
        }
      });
    });
  }

  log(sessionID: string): Observable<any> {


    this._baseUrl = `cocoon/View/ExecuteService/fr/AW_AuplResult3.text?${this.authInfos}${sessionID}&ServiceSubPackage=customer/Apps/DocCtrl&ServiceName=doc_CTRL.au&ServiceParameters=`;
    //this._baseUrl = `cocoon/View/ExecuteService/fr/AW_AuplResult3.text?${this.authInfos}${sessionID}&ServiceSubPackage=mehdi&ServiceName=doc_CTRL.au&ServiceParameters=`;
    console.log("url base est : ", this._baseUrl);
    const param = "login";
    const data = "";

    const url = `${this.audrosServer}${this._baseUrl}${param}@${data}@`;

    return this.http.get(url, {responseType: 'text'});
  }

  getObjectByRef(data: string, serv: string | null): Observable<any> {
    const param = "getDocument"; // Appel du backend pour la procédure "getDocument"
    const url = `${this.audrosServer}${this._baseUrl}${param}@${data};${serv}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getUsers(): Observable<any> {
    const param = "getCollection";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getLevell(): Observable<any> {
    const param = "getPilier";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getFonction(): Observable<any> {
    const param = "getFonction";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getSegment(): Observable<any> {
    const param = "getSegment";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getName(data: string): Observable<any> {
    const param = "getName";
    const url = `${this.audrosServer}${this._baseUrl}${param}@${data}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

}
