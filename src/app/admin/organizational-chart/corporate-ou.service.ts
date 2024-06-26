import {Injectable} from "@angular/core";
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {
    CorporateOu,
    CorporateOuBrief,
    OuBalanceDistribution, OuListSearch,
    OuTreeNode,
    PolicyCountResponseDto,
} from "./corporate-ou.model";
import {catchError} from "rxjs/operators";
import {handleError} from "@helpers/handle-error";
import {OuRoleUserNamesDto} from "@models/user.model";
import {AuthService} from "../../auth/auth.service";
import {Router} from "@angular/router";
import {OuNode} from "@models/ou-node.model";
import {BaseResponse} from "@models/response.model";

@Injectable({
    providedIn: "root",
})
export class CorporateOuService {
    
    apiUrl: string;
    listCorporateOus;
    userCountsMap = new Map<number, number>();
    assetCountsMap = new Map<number, any>();
    corporateOuUsersMap = new Map<number, OuRoleUserNamesDto[]>();
    private restAdminUsersSource = new Subject();
    restAdminUsers$ = this.restAdminUsersSource.asObservable();
    private listCorporateOusSource = new Subject();
    listCorporateOus$ = this.listCorporateOusSource.asObservable();
    private childrenOuIdsSource = new Subject<number[]>();
    childrenOuIds$ = this.childrenOuIdsSource.asObservable();
    private selectedOuNodeSource = new Subject();
    selectedOuNode$ = this.selectedOuNodeSource.asObservable();
    policyCount: PolicyCountResponseDto;
    selectedOuNode: OuNode;
    ouNames: { enName: string, localName, ouId: number }[] = [];

    constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
        this.apiUrl = `${environment.baseUrl}/corporate-orchestration-service/corporate`;
        const ASSET_COUNTS_MAP = sessionStorage.getItem("assetCountsMap");
        const USER_COUNTS_MAP = sessionStorage.getItem("userCountsMap");
        const ADMIN_USERS_MAP = sessionStorage.getItem("adminUsersMap");
        const POLICY_COUNT = sessionStorage.getItem("policyCount");
        this.assetCountsMap = ASSET_COUNTS_MAP
            ? new Map(JSON.parse(ASSET_COUNTS_MAP))
            : new Map();
        this.userCountsMap = USER_COUNTS_MAP
            ? new Map(JSON.parse(USER_COUNTS_MAP))
            : new Map();
        this.corporateOuUsersMap = ADMIN_USERS_MAP
            ? new Map(JSON.parse(ADMIN_USERS_MAP))
            : new Map();
        this.policyCount = POLICY_COUNT ? JSON.parse(POLICY_COUNT) : null;
    }

    getOuTabsStatus() {
        return (this.authService.getUserType() === "corporate") && this.authService.isOuEnabled() && !this.router.url.includes("organizational-chart/units");
    }

    getAdminOuTabsStatus() {
        return (this.authService.getUserType() === "admin") && JSON.parse(sessionStorage.getItem('adminCorporateOuEnabled'))
    }

    getCorporateOuHierarchy(
        corporateId: number,
        ouId: number
    ): Observable<OuTreeNode> {
        return this.http
            .get<OuTreeNode>(`${this.apiUrl}/${corporateId}/ou/${ouId}/hierarchy`)
            .pipe(catchError(handleError));
    }

    getOuBalanceHierarchy(
        corporateId: number,
        ouId: number
    ): Observable<OuBalanceDistribution> {
        return this.http
            .get<OuBalanceDistribution>(
                `${this.apiUrl}/${corporateId}/ou/${ouId}/balance/hierarchy`
            )
            .pipe(catchError(handleError));
    }

    getCorporateOuDetails(
        corporateId: number,
        ouId: number
    ): Observable<CorporateOu> {
        return this.http
            .get<CorporateOu>(`${this.apiUrl}/${corporateId}/ou/${ouId}`)
            .pipe(catchError(handleError));
    }

    getCorporateOuBrief(
        corporateId: number,
        ouId: number
    ): Observable<CorporateOuBrief> {
        return this.http
            .get<CorporateOuBrief>(`${this.apiUrl}/${corporateId}/ou/${ouId}/brief`)
            .pipe(catchError(handleError));
    }

    getCorporateOuChildren(
        corporateId: number,
        ouId: number
    ): Observable<number[]> {
        return this.http
            .get<number[]>(
                `${environment.baseUrl}/corporate-service/corporate/${corporateId}/ou/${ouId}/tree-ids`
            )
            .pipe(catchError(handleError));
    }

    getOusForCorporate(
        corporateId: number,
    ): Observable<CorporateOu[]> {
        return this.http
            .get<CorporateOu[]>(
                `${this.apiUrl}/${corporateId}/ou`
            )
            .pipe(catchError(handleError));
    }

    getPolicyCount(
        corporateId: number,
        ouIds: number[]
    ): Observable<PolicyCountResponseDto> {
        return this.http
            .get<PolicyCountResponseDto>(
                `${this.apiUrl}/${corporateId}/policy/count`,
                {
                    params: {
                        ...(ouIds && {ouIds}),
                    },
                }
            )
            .pipe(catchError(handleError));
    }

    createCorporateOu(
        corporateId: number,
        corporateOu: CorporateOu
    ): Observable<CorporateOu> {
        return this.http
            .post<CorporateOu>(`${this.apiUrl}/${corporateId}/ou`, corporateOu)
            .pipe(catchError(handleError));
    }

    ouBalanceTransfer(
        corporateId: number,
        sourceOuId: number,
        destinationOuId: number,
        amount: number
    ):Observable<OuBalanceDistribution>  {
        return this.http
            .patch<OuBalanceDistribution>(
                `${environment.baseUrl}/corporate-service/corporate/${corporateId}/ou/balance/transfer`, 
                {
                    ...(sourceOuId && {sourceOuId}),
                    ...(destinationOuId && {destinationOuId}),
                    ...(amount && {amount})
                })
        .pipe(catchError(handleError));
    }

    updateCorporateOu(
        corporateId: number,
        ouId: number,
        corporateOu: CorporateOu,
    ): Observable<CorporateOu> {
        return this.http
            .put<CorporateOu>(
                `${this.apiUrl}/${corporateId}/ou/${ouId}`,
                corporateOu
            )
            .pipe(catchError(handleError));
    }

    updateBalanceDistribution(
        corporateId: number,
        ouBalanceDistribution: OuBalanceDistribution,
        savePercentages: boolean = false
    ): Observable<OuBalanceDistribution> {
        return this.http
            .patch<OuBalanceDistribution>(
                `${this.apiUrl}/${corporateId}/ou/balance/distribute`,
                ouBalanceDistribution,
                {
                    params: {
                        ...(savePercentages && {savePercentages}),
                    }
                }
            )
            .pipe(catchError(handleError));
    }

    transferUsers(
        corporateId: number,
        sourceOuId: number,
        destinationOuId: number,
        userIds: number[]
    ): Observable<number> {
        return this.http
            .patch<number>(`${this.apiUrl}/${corporateId}/user/transfer`, null, {
                params: {
                    ...(sourceOuId && {sourceOuId}),
                    ...(destinationOuId && {destinationOuId}),
                    ...(userIds && {userIds}),
                    roleTag: "OU_ADMIN",
                },
            })
            .pipe(catchError(handleError));
    }

    onFetchCorporateOus(corporateOus: any) {
        this.listCorporateOus = corporateOus;
    }

    setPolicyCount(policyCount: PolicyCountResponseDto) {
        sessionStorage.setItem("policyCount", JSON.stringify(policyCount));
        this.policyCount = policyCount;
    }

    setUserCountsMap(userCountsMap) {
        sessionStorage.setItem("userCountsMap", JSON.stringify([...userCountsMap]));
        this.userCountsMap = userCountsMap;
    }

    setAssetCountsMap(assetCountsMap) {
        sessionStorage.setItem("assetCountsMap", JSON.stringify([...assetCountsMap]));
        this.assetCountsMap = assetCountsMap;
    }

    setAdminUsersMap(adminUsersMap) {
        sessionStorage.setItem("adminUsersMap", JSON.stringify([...adminUsersMap]));
        this.corporateOuUsersMap = adminUsersMap;
    }


    getProductCategoriesIdsByOuId(corporateId: number, ouId: number): Observable<number[]> {
        return this.http
            .get<number[]>(`${this.apiUrl}/${corporateId}/ou/${ouId}/product-category`)
            .pipe(catchError(handleError));
    }

    getOUList(
        corporateId: number,
        searchObj: OuListSearch,
        pageNo?: number,
        pageSize?: number
    ): Observable<BaseResponse<CorporateOu>> {
        return this.http
            .get<BaseResponse<CorporateOu>>(`${this.apiUrl}/${corporateId}/ou/list`, {
                params: {
                    ...searchObj,
                    ...(pageNo && {pageNo}),
                    ...(pageSize && {pageSize}),
                },
            })
            .pipe(catchError(handleError));
    }

    showRestAdminUsers(restAdminUsers) {
        this.restAdminUsersSource.next(restAdminUsers);
    }

    setChildrenOuIds(ouIds: number[]) {
        this.childrenOuIdsSource.next(ouIds);
    }
    setListCorporateOus(listCorporateOus: any) {
        this.listCorporateOusSource.next(listCorporateOus);
    }

    setOuName(entity, ou: CorporateOu, currentLang: string) {
        entity["ouName"] = currentLang === "en" ? ou?.enName ?? "" : ou?.localeName ?? "";
    }

    setSelectedOuNode(node: OuNode) {
        this.selectedOuNodeSource.next(node);
    }

    async fetchOuList(corporateId: number, ouList: OuListSearch) {
        const response = await this.getOUList(corporateId, ouList).toPromise();
        response.content.forEach(ou => {
            this.ouNames.push({
                enName: ou.enName,
                localName: ou.localeName,
                ouId: ou.id
            })
        })
    }

    getSelectedOuFromStorage() {
        return JSON.parse(sessionStorage.getItem('selectedOuNode'))
    }


    transferAssets(
        corporateId: number,
        sourceOuId: number,
        destinationOuId: number,
        assetIds: number[]
    ): Observable<number> {
        return this.http
            .patch<number>(`${this.apiUrl}/${corporateId}/asset/transfer`, null, {
                params: {
                    ...(sourceOuId && {sourceOuId}),
                    ...(destinationOuId && {destinationOuId}),
                    ...(assetIds && {assetIds}),
                },
            })
            .pipe(catchError(handleError));
      }
}
