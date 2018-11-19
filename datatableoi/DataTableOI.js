Vue.component("data-table-oi", {
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
                            <a href="#" style="color: #000" v-if="column.sort"><b>{{column.name}}</b><img style="width: 15px;float: right;margin-top: 3px" src="../assets/plugins/datatableoi/sort.png"></a>
                            <a href="#" style="color: #000; cursor: default" v-else><b>{{column.name}}</b></a>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="data in datas">
                        <td v-for="column in columns"><span v-for="fi in Object.keys(data)" v-if="column.field==fi">{{data[column.field]}}</span></td>
                      </tr>
                     </tbody>
                </table>
                
                <nav aria-label="" style="float: right">
                  <ul class="pagination" style="border: 1px #DDD solid">
                  
                    <li class="page-item" :class="{disabled : firstPage}"><a class="page-link" href="#" @click="previousPage" tabindex="-1">Geri</a></li>
                    
                    <li class="page-item" :class="{ active : page.active}" v-for="page in last_page">
                    
                        <a class="page-link" href="#" @click="getDatas(page.count)"  v-if="page.count<=pagem+3 && page.count>=pagem-3">{{page.count}}</a>
                        
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
            pagem: 1,
            sizem: 5,
            sortm: "",
            sorttypem: "asc",
            searchtextm: "",
            firstPage: true,
            lastPage: false,
            searchText: "",
            loadingShowTable: true,
        }
    },
    watch: {
        searchText: function (value) {
            if (!this.loadingShowTable) {
                if (value.trim().length > 2) {
                    console.log(value);
                    this.searchtextm = "&search=" + value.trim();
                    this.getDatas();
                } else if (value.length == 0) {
                    this.searchtextm = "";
                    console.log(value);
                    this.getDatas();
                }
                console.log(this.searchText);
            }
        },
    },
    methods: {
        sorted: function (column) {
            if (column.sort) {
                if (this.sorttypem == "asc")
                    this.sorttypem = "desc";
                else
                    this.sorttypem = "asc";
                this.sortm = "&sort=" + column.field + "&sorttype=" + this.sorttypem;
                this.getDatas();
            }
        },
        previousPage: function () {
            this.getDatas(this.pagem - 1);
        },
        nextPage: function () {
            this.getDatas(this.pagem + 1);
        },
        getDatas: function (pagem) {
            this.loadingShowTable = true;
            if (!pagem) {
                pagem = this.pagem;
            } else {
                this.pagem = pagem;
            }

            if (pagem == 1) {
                this.firstPage = true;
            } else {
                this.firstPage = false;
            }
            var vm = this;
            axios.post(this.url + "?page=" + pagem + "&size=" + vm.sizem + vm.sortm + vm.searchtextm)
                .then(function (response) {
                    if (response.data.last_page == pagem) {
                        vm.lastPage = true;
                    } else {
                        vm.lastPage = false;
                    }

                    console.log(response.data);
                    vm.last_page = [];
                    for (var a = 1; a <= response.data.last_page; a++) {
                        if (a == pagem)
                            vm.last_page.push({count: a, active: true});
                        else
                            vm.last_page.push({count: a, active: false});
                    }
                    vm.datas = response.data.data;

                    for(var column in vm.columns){
                        if(vm.columns[column].filter != null){

                            for(var data in vm.datas){
                                vm.datas[data][vm.columns[column].field] = Vue.filter(vm.columns[column].filter)(vm.datas[data][vm.columns[column].field]);
                            }
                        }
                    }

                    vm.loadingShowTable = false;
                }).catch(function (e) {
                console.log(e);
            });

        }
    },
    created(){
        if (this.show) {
            this.sizem = this.show;
        }

        this.getDatas();


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
 * resource_url: 'http://localhost:8080/Uygulama/rest/liste.json' => POST istek olmalı.
 *
 * loadingImage : "./assets/img/loading.gif"
 * ----------------------------------------------------------------------------------------
 *
 * Dinamik istekler için backend yapısı
 *
 *   - Gönderilecek İstek Yapısı
 *     	@RequestMapping(value="/liste.json",method=RequestMethod.POST)
 *       public ResponseEntity<ListNm> rezervasyonlistesi(
 *           @RequestParam(value = "page", required = false) String page,
 *           @RequestParam(value = "size", required = false) String size,   => Tek seferde kaç tane isteniyorsa (10)
 *           @RequestParam(value = "sort", required = false) String sort,
 *           @RequestParam(value = "sorttype", required = false) String sorttype,
 *           @RequestParam(value = "search", required = false) String search)
 *
 *   - DönüşTipi (ListNm)
 *       public class ListNm {
 *           private String current_page;
 *           private String last_page;
 *           private String size;            =>tek seferde kaç tane gönderilecekse (10)
 *           private ArrayList<nDatam> data;
 *       }
 *
 *-------------------------------------------------------------------------------------------
 *
 * Backend işlemleri için yardımcı olacak bir açıklama
 *
 *      ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *      || Integer totalCount = service.getTotalCount(search);
 *      || Integer pageCount = totalCount / size;
 *      || if(totalCount % size != 0) {
 *      ||     pageCount++;
 *      || }
 *      || listNm.setCurrent_page(page+"");
 *      || listNm.setLast_page(pageCount+"");
 *      || listNm.setSize(size+"");
 *      || ArrayList<nDatam> nm = service.getfindBySearch(size, page, sort, sorttype, search);
 *      || listNm.setData(nm);
 *      ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *
 *-------------------------------------------------------------------------------------------
 *
 * Backend DB İşlemleri için yardımcı olacak bir açıklama
 *
 *      ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *      || public Integer getTotalCount(String search){
 *      ||    Query query;
 *      ||    if(search != null) {
 *      ||        query = sessionFactory.getCurrentSession().createNativeQuery("SELECT count(*) FROM tabloDBAdi WHERE active=:active AND "
 *      ||                    + "lower(fiedl1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
 *      ||                    + "lower(fiedl2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ")
 *      ||                    .setBoolean("active", true);
 *      ||    }else {
 *      ||        query = sessionFactory.getCurrentSession()
 *      ||                    .createNativeQuery("SELECT count(*) FROM tabloDBAdi WHERE active=:active")
 *      ||                    .setBoolean("active", true);
 *      ||    }
 *      ||    return Integer.parseInt(query.uniqueResult() + "");
 *      || }
 *      |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *
 *
 *      ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *      || public ArrayList<nDatam> getfindBySearch(int limit,int page, String sort, String sorttype, String search) {
 *      || 		Query query;
 *      || 		if(sort == null) {
 *      || 			query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active ORDER BY id asc")
 *      || 				        .setBoolean("active", true);
 *      ||
 *      || 			if(search != null) {
 *      || 				query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active AND "
 *      || 								+ "lower(field1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
 *      || 								+ "lower(field2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ORDER BY id asc")
 *      || 						.setBoolean("active", true);
 *      || 			}
 *      || 		}else {
 *      || 			query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active ORDER BY "+sort+" "+sorttype)
 *      || 					    .setBoolean("active", true);
 *      ||
 *      || 			if(search != null) {
 *      || 				query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active AND "
 *      || 						        + "lower(field1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
 *      || 						        + "lower(field2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ORDER BY "+sort+" "+sorttype)
 *      || 				        .setBoolean("active", true);
 *      || 			}
 *      || 		}
 *      || 		if(page != -1){
 *      || 			page--;
 *      || 			int size = page * limit;
 *      || 			query.setFirstResult(size);
 *      || 		}
 *      || 		query.setMaxResults(limit);
 *      || 		return (ArrayList<nDatam>) query.list();
 *      || }
 *      |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *
 ***********************************************************************************************************************/
