import { trigger, transition, style, animate } from '@angular/animations';

export const listAddRemoveTrigger = trigger('listAddRemoveTrigger', [
    transition(':enter', [style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))]),
    transition(':leave', [animate('100ms', style({ height: 0 }))]),
]);
