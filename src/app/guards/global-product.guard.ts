// import {Injectable} from '@angular/core';
// import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
// import {Observable} from 'rxjs';
// import {ProductCategoryService} from "../admin/product/productCategory.service";
// import {SubSink} from "subsink";
// import {map} from "rxjs/operators";
// import {AuthService} from "../auth/auth.service";

// @Injectable({
//   providedIn: 'root'
// })
// export class GlobalProductGuard implements CanActivate {
//   private subs = new SubSink();

//   constructor(private productCategoryService: ProductCategoryService,productService: ProductSer, private router: Router, private authService: AuthService) {
//   }

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

//     return this.productCategoryService.getProduct(+route.params.merchantProductId).pipe(map((product) => {
//       if (product.global === true) {
//         const userType = this.authService.getUserType()?.toLowerCase()
//         if (userType === 'admin') {
//           this.router.navigate([`/admin/merchants/${route.params.merchantId}/details/products`]);
//         } else if (userType === 'merchant') {
//           this.router.navigate([`/merchant/products`]);
//         }
//         return false;
//       }
//       return true;
//     }, err => {
//       console.log(err);
//     }));
//   }
// }

  //this is wrong as you call try to get product category with product id
