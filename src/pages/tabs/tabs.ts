import {Component, ElementRef, ViewChild, Renderer} from '@angular/core';
import {ModalController, Events} from "ionic-angular";

import {TabHomePage} from "../tab-home/tab-home";
import {TabSearchPage} from "../tab-search/tab-search";
import {TabActivityPage} from "../tab-activity/tab-activity";
import {TabAccountPage} from "../tab-account/tab-account";
import {IonicUtil} from "../../providers/ionic-util";
import {IonPhotoCropModal} from "../../components/ion-photo/ion-photo-crop-modal/ion-photo-crop-modal";
import {PhotoShareModal} from "../../components/photo-share-modal/photo-share-modal";
import {IonPhotoService} from "../../components/ion-photo/ion-photo-service";
import {Gallery} from "../../providers/gallery";
import {ParseFile} from "../../providers/parse-file";

@Component({
    templateUrl: 'tabs.html'
})

export class TabsPage {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    tabHome: any     = TabHomePage;
    tabSearch: any   = TabSearchPage;
    tabActivity: any = TabActivityPage;
    tabProfile: any  = TabAccountPage;
    @ViewChild('inputFile') input: ElementRef;

    cordova: boolean   = false;
    _eventName: string = 'photoshare';

    constructor(private photoService: IonPhotoService,
                private util: IonicUtil,
                private modalCtrl: ModalController,
                private render: Renderer,
                private events: Events,
                private provider: Gallery,
                private ParseFile: ParseFile
    ) {
        this.cordova = this.util.cordova;

        // Open Capture Photo
        this.events.subscribe('photoservice', eventName => {
            this.openCapture(eventName[0]);
        });

        // Open Share Modal
        this.events.subscribe(this._eventName, _imageCroped => {
            let modal = this.modalCtrl.create(PhotoShareModal, {base64: _imageCroped[0]});
            modal.onDidDismiss(response => {
                console.log(response);
                if (response) {
                    this.ParseFile.upload({base64: response.image}).then(image => {
                        let form   = response.form;
                        form.image = image;

                        this.provider.put(form).then(item => {
                            console.log(item);
                            item.loading = false;
                            console.warn('Event home:reload');
                            this.events.publish('home:reload');

                        }).catch(error => {
                            console.log(error);
                        });
                    });
                }
            });
            modal.present();
        });
    }


    openCapture(eventname) {
        this._eventName = eventname;
        if (this.cordova) {
            this.photoService.open()
                .then(image => this.cropImage(image))
                .catch(error => {
                    console.log(error);
                    this.util.toast(error);
                });
        } else {
            this.render.invokeElementMethod(this.input.nativeElement, 'click');
        }
    }

    cropImage(image) {
        this.modalCtrl.create(IonPhotoCropModal, {base64: image, eventName: this._eventName}).present();
    }

    onChange(event) {
        let files     = event.srcElement.files;
        let image     = files[0];
        let reader    = new FileReader();
        reader.onload = (evt) => {
            let image = evt.srcElement['result'];
            this.cropImage(image)
        };
        reader.readAsDataURL(image);
    }
}
