import {Component} from '@angular/core';
import {App, ModalController} from 'ionic-angular';
import {Auth} from "../../providers/auth";
import {IntroPage} from "../intro/intro";
import {UserPasswordPage} from "../user-password/user-password";
import {AccountEditModalPage} from "../account-edit-modal/account-edit-modal";
import {IonicUtil} from "../../providers/ionic-util";
import {AboutPage} from "../about/about";
import {LanguageModalComponent} from "../../components/language-modal/language-modal";


@Component({
    selector   : 'page-tab-account-settings',
    templateUrl: 'tab-account-settings.html'
})
export class TabAccountSettingsPage {


    constructor(private Auth: Auth,
                private app: App,
                private modalCtrl: ModalController,
                private util: IonicUtil
    ) {}


    aboutPage(): void {
        this.modalCtrl.create(AboutPage).present();
    }

    modalLanguage() {
        this.modalCtrl.create(LanguageModalComponent).present();
    }

    href(url): void {
        this.util.href(url);
    }

    changePassword(): void {
        this.modalCtrl.create(UserPasswordPage).present();
    }

    editModal(): void {
        this.modalCtrl.create(AccountEditModalPage).present();
    }

    logout(): void {
        this.Auth.logout();
        this.app.getRootNav().setRoot(IntroPage);
    }

}
