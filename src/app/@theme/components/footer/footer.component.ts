import {Component} from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      {{'app.companyName' | translate}} &copy; 2023 Powered by Solarus Smart Solutions S.A.E
    </span>
<!--    <div class="socials">-->
<!--      <a href="#" target="_blank" class="ion ion-social-github"></a>-->
<!--      <a href="#" target="_blank" class="ion ion-social-facebook"></a>-->
<!--      <a href="#" target="_blank" class="ion ion-social-twitter"></a>-->
<!--      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>-->
<!--    </div>-->
  `,
})
export class FooterComponent {
}
