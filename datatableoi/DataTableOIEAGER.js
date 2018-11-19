Vue.component("data-table-oi-eager", {
    template: `
        <div>
        
            <div style="float: right;width: 200px;margin-right: 20px;margin-bottom: 10px" >
                <label for="arama"  style="padding-right:0px;float: left;margin-top: 6px">Arama </label>
                <div style="padding-left:0px;width: 130px;float: left;margin-left: 5px">
                  <input type="text" id="arama" v-model="searchText"  autofocus style="border: 1px #CCC solid; border-radius: 5px;padding: 3px" > 
                </div> 
            </div>
        
            <div v-if="loadingShowTable">
                <img :src="loadingimage?loadingimage:'../assets/plugins/datatableoi/loading.svg'">
            </div>
            
            <div  v-else>
                
                <table class="table table-bordered" style="table-layout: fixed; font-size: 14px;">
                    <thead style="background-color: #24C5D9;opacity: 0.7;padding: 0.75rem 1.25rem;margin-bottom: 0;border-bottom: 1px solid #eeeeee;box-shadow: 0 5px 15px -8px rgba(0, 0, 0, 0.24), 0 8px 10px -5px rgba(0, 0, 0, 0.2); ">
                      <tr>
                        <th v-for="column in columns" @click="sorted(column)" :style="{cursor : column.sort?'pointer':'default'}">
                            <a href="#" style="color: #000" v-if="column.sort"><b>{{column.name}}</b><img style="width: 15px;float: right;margin-top: 3px" src="sort.png"></a>
                            <a href="#" style="color: #000; cursor: default" v-else><b>{{column.name}}</b></a> 
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(data,index) in datas" v-if="index<sizem*pagem && (pagem-1)*sizem<index">
                        <td v-for="column in columns"><span v-for="fi in Object.keys(data)" v-if="column.field==fi">{{data[column.field]}}</span></td>
                    
                      </tr>
                     </tbody>
                </table>
                
                <nav aria-label="" style="float: right">
                  <ul class="pagination" style="border: 1px #DDD solid">
                  
                    <li class="page-item" :class="{disabled : firstPage}"><a class="page-link" href="#" @click="previousPage" tabindex="-1">Geri</a></li>
                    
                    <li class="page-item" :class="{ active : page.active}" v-for="page in last_page">
                    
                        <a class="page-link" href="#" @click="changePage(page)"  v-if="page.count<=pagem+3 && page.count>=pagem-3">{{page.count}}</a>
                        
                    </li>
                    
                    
                    <li class="page-item" :class="{disabled : lastPage}"><a class="page-link" href="#" @click="nextPage">İleri</a></li>
                    
                  </ul>
                </nav>
            </div>
        </div>
    `,
    props: ["show", "columns", "url", "loadingimage"],
    data: function () {
        return {
            //columns:[{name:"Konu",field:"konusu"},{name:"Tarihi",field:"rezerve_tarihi",sort:true},{name:"Başlama Saati",field:"baslama_saati"}],
            datas: [],
            last_page: [],
            totalCount : 0,
            pagem: 1,
            sizem: 5,
            sortm: "",
            sorttypem: "asc",
            searchtextm: "",
            firstPage: true,
            lastPage: false,
            searchText: "",
            loadingShowTable: true,
            sortboolean : false,
            temp_datas : [],
        }
    },
    watch: {
        searchText: function (value) {
            if (!this.loadingShowTable) {
                if (value.trim().length > 2) {

                    if(this.temp_datas.length>0)
                        this.datas = this.temp_datas;

                    var results = [];
                    var toSearch = value.trim(); // trim it
                    for(var i=0; i<this.datas.length; i++) {
                        for(var s= 0;s<this.columns.length;s++){
                            if(this.datas[i][this.columns[s].field]!= null && this.datas[i][this.columns[s].field].toString().toLocaleLowerCase().indexOf(toSearch.toLocaleLowerCase())!=-1) {
                                if(!this.itemExists(results, this.datas[i])) results.push(this.datas[i]);
                            }
                        }
                    }

                    this.temp_datas = this.datas;

                    this.datas = results;

                    this.setting(1);

                } else if (value.length == 0) {
                    this.datas = this.temp_datas;
                    this.setting(1);
                }
            }

        },
    },
    methods: {
        itemExists(haystack, needle) {
            for(var i=0; i<haystack.length; i++) if(this.compareObjects(haystack[i], needle)) return true;
            return false;
        },
        compareObjects(o1, o2) {
            var k = '';
            for(k in o1) if(o1[k] != o2[k]) return false;
            for(k in o2) if(o1[k] != o2[k]) return false;
            return true;
        },
        sorted: function (column) {
            if(column.sort){
                this.sortboolean = !this.sortboolean;

                var vm = this;

                this.datas.sort(function(a,b) {

                    if(typeof a[column.field] == "number"){
                        if(vm.sortboolean == true){
                            return a[column.field] - b[column.field];
                        }else{
                            return b[column.field] - a[column.field];
                        }
                    }else if(typeof a[column.field] == "boolean"){
                        if(vm.sortboolean == true)
                            return (a[column.field].isOdeme === b[column.field].isOdeme)? 0 : a[column.field].isOdeme? -1 : 1;
                        else
                            return (a[column.field].isOdeme === b[column.field].isOdeme)? 0 : b[column.field].isOdeme? -1 : 1;
                    }else{
                        var x = a[column.field].toLocaleLowerCase();
                        var y = b[column.field].toLocaleLowerCase();
                        if(vm.sortboolean == true)
                            return x < y ? -1 : x > y ? 1 : 0;
                        else
                            return x > y ? -1 : x > y ? 1 : 0;
                    }

                });
            }
        },
        previousPage: function () {
            this.pagem--;
            this.paginationChange();
        },
        nextPage: function () {
            this.pagem++;
            this.paginationChange();
        },
        changePage : function (pagem) {
            if (!pagem) {
                pagem.count = this.pagem;
            } else {
                this.pagem = pagem.count;
            }
            this.paginationChange();
        },
        paginationChange : function () {
            for(var a=0; a<this.last_page.length;a++){
                this.last_page[a].active=false;
                if(this.last_page[a].count == this.pagem){
                    this.last_page[a].active=true;
                }
                if(this.pagem == parseInt(this.totalCount)){
                    this.lastPage = true;
                }else{
                    this.lastPage = false;
                }
                if(this.pagem != 1){
                    this.firstPage = false;
                }else{
                    this.firstPage = true;
                }
            }
        },
        getDatas: function (pagem) {
            this.loadingShowTable = true;
            if (!pagem) {
                pagem = this.pagem;
            } else {
                this.pagem = pagem;
            }

            var vm = this;
            axios.post(this.url)
                .then(function (response) {

                    console.log(response.data);

                    vm.datas = response.data.data;

                    vm.setting(pagem);

                    vm.loadingShowTable = false;
                }).catch(function (e) {
                    console.log(e);
            });

        },
        setting : function (pagem) {
            if (!pagem) {
                pagem = this.pagem;
            } else {
                this.pagem = pagem;
            }

            var totalCount = this.datas.length/this.sizem;
            if(totalCount%this.sizem != 0){
                totalCount++;
            }
            this.totalCount = totalCount;
            this.last_page = [];
            for (var a = 1; a <= totalCount; a++) {
                if (a == pagem)
                    this.last_page.push({count: a, active: true});
                else
                    this.last_page.push({count: a, active: false});
            }

            for(var column in this.columns){
                if(this.columns[column].filter != null){

                    for(var data in this.datas){
                        this.datas[data][this.columns[column].field] = Vue.filter(this.columns[column].filter)(this.datas[data][this.columns[column].field]);
                    }
                }
            }
        }
    },
    created(){
        if (this.show) {
            this.sizem = this.show;
        }

        console.log(Vue.filter("filterName")("onur"));


        this.getDatas();

    },
    filters : {
        deneme : function () {
            return "1111";
        }
    }
});




//KULLANIM
/***********************************************************************************************************************
 * Onur Ciner - v.1.0 - DataTableOI
 *
 * Kullanım şekli
 *
 * <data-table-oi :show="10" :columns="kolonlar" :url="resource_url"></data-table-oi>
 * ----------------------
 * kolonlar : [{name:"Konu",field:"konusu"},
 *             {name:"Tarihi",field:"rezerve_tarihi",sort:true},
 *             {name:"Başlama Saati",field:"baslama_saati", filter : 'filterName' }] => filterName global olarak tanımlanmış bir Vue.filter objesi olmalı.
 *                                                                                          Vue.filter('filterName', function(value){ return value+'...' }); //Şeklinde
 *
 * resource_url: 'http://localhost:8080/Uygulama/rest/liste.json' => POST istek olmalı. Tüm data gelmeli.
 *
 * loadingImage : "./assets/img/loading.gif"
 * ----------------------------------------------------------------------------------------
 *
 * Dinamik istekler için backend yapısı
 *
 *   - Gönderilecek İstek Yapısı
 *     	@RequestMapping(value="/liste.json",method=RequestMethod.POST)
 *       public ResponseEntity<ListNm> rezervasyonlistesi()
 *
 *   - DönüşTipi (ListNm)
 *       public class ListNm {
 *           private ArrayList<nDatam> data;
 *       }
 *
 *-------------------------------------------------------------------------------------------
 *
 ***********************************************************************************************************************/
