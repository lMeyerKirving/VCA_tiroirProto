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


  log(sessionID: string): Observable<any> {


    this._baseUrl = `cocoon/View/ExecuteService/fr/AW_AuplResult3.text?${this.authInfos}${sessionID}&ServiceSubPackage=customer/Apps/photoProto&ServiceName=photo_PROTO.au&ServiceParameters=`;
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

  getCollection(): Observable<any> {
    const param = "getCollection";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getPilier(): Observable<any> {
    const param = "getPilier";
    const url = `${this.audrosServer}${this._baseUrl}${param}@`;
    console.log("URL générée pour getObjectByRef : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getFabricant(): Observable<any> {
    const param = "getFabricant";
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

  getAttachment(data: string, serv: string | null): Observable<any> {
    const param = "getAttachment";
    const url = `${this.audrosServer}${this._baseUrl}${param}@${data};${serv}@`;
    console.log("Url générée pour getAttachment : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

  getFonction(data: string): Observable<any> {
    const param = "getFonction";
    const url = `${this.audrosServer}${this._baseUrl}${param}@${data}@`;
    console.log("Url générée pour getAttachment : ", url);
    return this.http.get<any>(url, { responseType: 'json' });
  }

}
