import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import jwt_decode from "jwt-decode";
import {ToastrService} from "ngx-toastr";
import {environment} from "@environments/environment";
import {handleError} from "@helpers/handle-error";
import {catchError} from "rxjs/operators";
import {TokenDTO, TokenInfo, UserType} from "./login.model";
import {TranslateService} from "@ngx-translate/core";
import {BehaviorSubject, Observable} from "rxjs";
import { ReportService } from "@shared/services/report.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrlAuth = `${environment.baseUrl}/security-service`;
  merchantId: number;
  isUnauthenticated: boolean = false;
  loading=new BehaviorSubject(false)

  // private baseUrl = "http://15.185.116.204:8080/security-service/auth";
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService,
    private reportService: ReportService
  ) {
  }

  login(username: string, password: string) {
    if (username && password) {
      this.loading.next(true)
      this.http
        .post<any>(`${this.baseUrlAuth}/auth/login`, {
          username: username.trim(),
          password,
        })
        .subscribe(
          ({token, refreshTokenDto}) => {
            this.loading.next(false)

            this.isUnauthenticated = false;
            this.setsessionStorage("userName", username);
            this.setsessionStorage("token", token);
            this.setsessionStorage("refreshToken", refreshTokenDto?.token);
            const tokenInfo: TokenInfo = this.getDecodeAccessToken(token);
            if (tokenInfo.userType) {
              this.saveTokenInfo(tokenInfo);
              switch (tokenInfo.userType) {
                case UserType.merchant:
                  this.router.navigate(["/merchant"]);
                  break;
                case UserType.admin:
                  this.router.navigate(["/admin"]);
                  break;
                case UserType.corporate:
                  this.router.navigate(["/corporate"]);
                  break;
                case UserType.masterCorporate:
                  this.router.navigate(["/master_corporate"]);
                  break;
                default:
                  this.router.navigate(["/auth"]);
                  break;
              }
            }
          },
          (error) => {
            this.loading.next(false)

            if (error.status === 401) {
              this.isUnauthenticated = true;
              this.translate.get("login.invalidLogin").subscribe((res) => {
                this.toastr.error(res);
              });
            } else {
              this.translate.get("login.errorMsg").subscribe((res) => {
                this.toastr.error(res);
              });
              // this.toastr.error(error.message, "Error");
            }
          }
        );
    } else {
      this.translate
        .get(["error.enterUserNameAndPassword", "type.error"])
        .subscribe((res) => {
          this.toastr.error(
            Object.values(res)[0] as string,
            Object.values(res)[1] as string
          );
        });
    }
  }

  getRefreshToken(refreshToken: string): Observable<TokenDTO> {
    return this.http
      .post<TokenDTO>(`${this.baseUrlAuth}/auth/refresh-token`, {refreshToken})
      .pipe(catchError(handleError));
  }

  public getDecodeAccessToken(token: string): TokenInfo {
    try {
      return jwt_decode(token);
    } catch (error) {
      return null;
    }
  }

  getLoggedInUserRoles() {
    const tokenInfo: TokenInfo = this.getDecodeAccessToken(
      sessionStorage.getItem("token")
    );
    if (tokenInfo?.roles?.length > 0) {
      return tokenInfo.roles;
    }
  }

  setsessionStorage(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  logout(): void {
    sessionStorage.clear();
    this.reportService.ouIds = null;
    this.reportService.date = null;
    this.router.navigate(["/auth"]);
  }

  getUserType(): string {
    return sessionStorage.getItem("userType") === "ADMINISTRATION"
      ? "admin"
      : sessionStorage.getItem("userType")?.toLowerCase();
  }

  getUserId(): number {
    return +sessionStorage.getItem("userId");
  }

  getUserName(): string {
    return sessionStorage.getItem("userName");
  }

  isOuEnabled() {
    return sessionStorage.getItem("ouEnabled") === "true";
  }
  isAdminCorporateOuEnabled() {
    return sessionStorage.getItem("adminCorporateOuEnabled") === "true"
  }

  getOuId() {
    return JSON.parse(sessionStorage.getItem('ouId'));
  }

  getRootOuId() {
    return +sessionStorage.getItem('rootOuId');
  }


  getStoredSelectedOuNodeId(){
    return JSON.parse(sessionStorage.getItem('selectedOuNode'))?.id;
  }

  getOuTreeIds() {
    return sessionStorage.getItem('ouTreeIds')?.trim();
  }

  changePassword(currentPassword, newPassword) {
    return this.http
      .post(`${this.baseUrlAuth}/password/change`, {
        currentPassword: currentPassword,
        newPassword: newPassword,
      })
      .pipe(catchError(handleError));
  }

  forgetPasswordUserName(username) {
    return this.http
      .post(`${this.baseUrlAuth}/password/forget?username=${username}`, {})
      .pipe(catchError(handleError));
  }

  validateToken(token) {
    return this.http
      .post(`${this.baseUrlAuth}/password/reset/validate?token=${token}`, {})
      .pipe(catchError(handleError));
  }

  resetPassword(token, password) {
    return this.http
      .post(
        `${this.baseUrlAuth}/password/reset?token=${token}&password=${password}`,
        {}
      )
      .pipe(catchError(handleError));
  }

  overRideToken(token, refreshTokenDto) {
    this.setsessionStorage('token', token);
    this.setsessionStorage('refreshToken', refreshTokenDto.token);
    const tokenInfo: TokenInfo = this.getDecodeAccessToken(token);
    if (tokenInfo.userType) {
      this.saveTokenInfo(tokenInfo);
    }
  }

  saveTokenInfo(tokenInfo: TokenInfo) {
    this.setsessionStorage("userType", tokenInfo?.userType);
    if (tokenInfo?.relatedSystemId) {
      this.setsessionStorage(
        "relatedSystemId",
        tokenInfo?.relatedSystemId?.toString()
      );
    }
    if (tokenInfo?.relatedSystemIds) {
      this.setsessionStorage(
        "relatedSystemIds",
        tokenInfo?.relatedSystemIds?.toString()
      );
    }
    if (tokenInfo?.masterSystemId) {
      this.setsessionStorage(
        "masterSystemId",
        tokenInfo?.masterSystemId?.toString()
      );
    }
    if (tokenInfo?.ouId) {
      this.setsessionStorage(
        "ouId",
        tokenInfo?.ouId?.toString()
      );
    }
    if (tokenInfo?.ouTreeIds) {
      this.setsessionStorage(
        "ouTreeIds",
        tokenInfo?.ouTreeIds?.toString()
      );
    }
    if (tokenInfo?.userId) {
      this.setsessionStorage(
        "userId",
        tokenInfo?.userId?.toString()
      );
    }
    if (tokenInfo?.ouEnabled !== null) {
      this.setsessionStorage(
        "ouEnabled",
        tokenInfo?.ouEnabled?.toString()
      );
    }
  }
}
