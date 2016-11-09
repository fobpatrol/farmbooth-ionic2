import {Injectable} from '@angular/core';
import {ActionSheetController, Platform} from "ionic-angular";
import {Camera} from 'ionic-native';
import {IonicUtil} from "./ionic-util";

@Injectable()
export class PhotoService {

    _base64Image: any;
    _cordova: boolean = false;

    _options: any = {
        allowEdit      : true,
        sourceType     : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        mediaType      : Camera.MediaType.ALLMEDIA,
        destinationType: Camera.DestinationType.FILE_URI
    };

    _setting = {
        quality           : 90,
        width             : 640,
        height            : 640,
        saveToPhotoAlbum  : false,
        allowEdit         : true,
        correctOrientation: true,
        allowRotation     : true,
        aspectRatio       : 0
    };

    _translateOption: string;
    _translateCamera: string;
    _translateLibrary: string;
    _translateCancel: string;
    _translateNotCordova: string;

    constructor(private actionSheetCtrl: ActionSheetController,
                private platform: Platform,
                private util: IonicUtil
    ) {
        this._cordova = this.platform.is('cordova') ? true : false;
        // Translate
        this.util.translate('Chose Option').then(result => this._translateOption = result);
        this.util.translate('Camera').then(result => this._translateCamera = result);
        this.util.translate('Photo library').then(result => this._translateLibrary = result);
        this.util.translate('Cancel').then(result => this._translateCancel = result);
        this.util.translate('Browser not supported').then(result => this._translateNotCordova = result);
    }

    open() {
        return new Promise((resolve, reject) => {
            this.actionSheetCtrl.create({
                title  : this._translateOption,
                buttons: [
                    {
                        text   : this._translateCamera,
                        icon   : 'camera',
                        handler: () => {
                            if (this._cordova) {
                                this.camera().then(image => resolve(image)).catch(error => reject(error));
                            } else {
                                reject(this._translateNotCordova);
                            }
                        }
                    },
                    {
                        text   : this._translateLibrary,
                        icon   : 'images',
                        handler: () => {
                            if (this._cordova) {
                                this.photoLibrary().then(image => resolve(image)).catch(error => reject(error));
                            } else {
                                reject(this._translateNotCordova);
                            }
                        }
                    },
                    {
                        text: this._translateCancel,
                        icon: 'close'
                    }
                ]
            }).present();
        });
    }

    camera() {
        return new Promise((resolve, reject) => {
            Camera.getPicture({
                targetWidth       : this._setting.width,
                targetHeight      : this._setting.height,
                quality           : this._setting.quality,
                allowEdit         : this._setting.allowEdit,
                saveToPhotoAlbum  : this._setting.saveToPhotoAlbum,
                sourceType        : Camera.PictureSourceType.CAMERA,
                destinationType   : Camera.DestinationType.DATA_URL,
                encodingType      : Camera.EncodingType.JPEG,
                correctOrientation: true,
            }).then((imageData) => {
                // imageData is a base64 encoded string
                let base64        = 'data:image/jpeg;base64,' + imageData;
                console.log('camera:base64', base64);
                this._base64Image = base64;
                resolve(base64);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    photoLibrary() {
        return new Promise((resolve, reject) => {
            Camera.getPicture({
                targetWidth       : this._setting.width,
                targetHeight      : this._setting.height,
                quality           : this._setting.quality,
                allowEdit         : this._setting.allowEdit,
                saveToPhotoAlbum  : this._setting.allowEdit,
                sourceType        : Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType   : Camera.DestinationType.DATA_URL,
                encodingType      : Camera.EncodingType.JPEG,
                correctOrientation: true,
            }).then((imageData) => {
                // imageData is a base64 encoded string
                let base64        = 'data:image/jpeg;base64,' + imageData;
                console.log('photoLibrary:base64', base64);
                this._base64Image = base64;
                resolve(base64);
            }, (err) => {
                console.log(err);
                reject(err);
            });
        });
    }


    // Return a promise to catch errors while loading image
    getMedia(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Get Image from ionic-native's built in camera plugin
            Camera.getPicture(this._options).then(fileUri => {
                // Crop Image, on android this returns something like, '/storage/emulated/0/Android/...'
                // Only giving an android example as ionic-native camera has built in cropping ability
                if (this.platform.is('android')) {
                    // Modify fileUri format, may not always be necessary
                    fileUri       = 'file://' + fileUri;
                    const options = {quality: 100};
                    /* Using cordova-plugin-crop starts here */
                    plugins.crop.promise(fileUri, options).then((path) => {
                        // path looks like 'file:///storage/emulated/0/Android/data/com.foo.bar/cache/1477008080626-cropped.jpg?1477008106566'
                        console.log('Cropped Image Path!: ' + path);
                        // Do whatever you want with new path such as read in a file
                        // Here we resolve the path to finish, but normally you would now want to read in the file
                        resolve(path);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    libraryLocal() {
        return new Promise((resolve, reject) => {
            let fileInput = document.createElement('<input type="file" accept="image/x-png, image/gif, image/jpeg" max-size="2048" />');
            fileInput[0].click();
            fileInput.addEventListener('change', (evt: any) => {
                let image     = evt.target.result[0];
                let reader    = new FileReader();
                reader.onload = (evt) => resolve(evt);
                reader.readAsDataURL(image);
            });
        });

    }

}