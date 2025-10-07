import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import DataTable from 'primevue/datatable';
import Row from 'primevue/row';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Column', Column);
  nuxtApp.vueApp.component('ColumnGroup', ColumnGroup);
  nuxtApp.vueApp.component('DataTable', DataTable);
  nuxtApp.vueApp.component('Row', Row);
});