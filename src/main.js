import { createApp } from 'vue';
import './style.css';
import App from './app.vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import {
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    ToastService,
    Toolbar,
    Tooltip
} from 'primevue';
import i18n from './i18n.js';
import router from './router.js';
import pinia from './pinia.js';

const WoodRoute = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#fff3ef',
            100: '#ffe4dc',
            200: '#ffcbbe',
            300: '#ffaa94',
            400: '#fe7a5a',
            500: '#FD4319',
            600: '#E23415',
            700: '#bf2a0f',
            800: '#9c240d',
            900: '#7d1e0c',
            950: '#430f05'
        },
        colorScheme: {
            light: {
                surface: {
                    0:   '#FFFFFF',
                    50:  '#FAF7F2',
                    100: '#F8F2EC',
                    200: '#F0E4D8',
                    300: '#EAE2D6',
                    400: '#E6DDD1',
                    500: '#D6C5B3',
                    600: '#63523A',
                    700: '#443218',
                    800: '#2a1e0f',
                    900: '#1A1715',
                    950: '#0d0b09'
                },
                primary: {
                    color:         '#FD4319',
                    contrastColor: '#FFFFFF',
                    hoverColor:    '#E23415',
                    activeColor:   '#bf2a0f'
                },
                highlight: {
                    background:      '#fff3ef',
                    focusBackground: '#ffe4dc',
                    color:           '#FD4319',
                    focusColor:      '#E23415'
                }
            },
            dark: {
                surface: {
                    0:   '#1A1715',
                    50:  '#221d19',
                    100: '#2a2420',
                    200: '#322b27',
                    300: '#423a35',
                    400: '#544a43',
                    500: '#6f645d',
                    600: '#9c9188',
                    700: '#c9beb6',
                    800: '#e8ddd5',
                    900: '#f5ede6',
                    950: '#fcf8f4'
                },
                primary: {
                    color:         '#FE7A5A',
                    contrastColor: '#1A1715',
                    hoverColor:    '#FD4319',
                    activeColor:   '#E23415'
                },
                highlight: {
                    background:      '#43231B',
                    focusBackground: '#5B2E24',
                    color:           '#FE7A5A',
                    focusColor:      '#FD4319'
                }
            }
        }
    },
    components: {
        button:    { borderRadius: '0.5rem' },
        inputtext: { borderRadius: '0.5rem' },
        select:    { borderRadius: '0.5rem' },
        textarea:  { borderRadius: '0.5rem' },
        card:      { borderRadius: '0.75rem' },
        dialog:    { borderRadius: '0.75rem' },
        drawer:    { borderRadius: '0.75rem' },
        tag:       { borderRadius: '0.375rem' }
    }
});

createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(PrimeVue, {
        theme: {
            preset: WoodRoute,
            options: {
                darkModeSelector: '.app-dark'
            }
        },
        ripple: true
    })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-breadcrumb',   Breadcrumb)
    .component('pv-button',       Button)
    .component('pv-card',         Card)
    .component('pv-checkbox',     Checkbox)
    .component('pv-column',       Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table',   DataTable)
    .component('pv-dialog',       Dialog)
    .component('pv-drawer',       Drawer)
    .component('pv-file-upload',  FileUpload)
    .component('pv-float-label',  FloatLabel)
    .component('pv-icon-field',   IconField)
    .component('pv-input-icon',   InputIcon)
    .component('pv-input-number', InputNumber)
    .component('pv-input-text',   InputText)
    .component('pv-menu',         Menu)
    .component('pv-rating',       Rating)
    .component('pv-row',          Row)
    .component('pv-select',       Select)
    .component('pv-select-button', SelectButton)
    .component('pv-tag',          Tag)
    .component('pv-textarea',     Textarea)
    .component('pv-toast',        Toast)
    .component('pv-toolbar',      Toolbar)
    .directive('tooltip',         Tooltip)
    .mount('#app');
