# vue-datatableoi

Kullanım şekli
<data-table-oi :show="10" :columns="kolonlar" :url="resource_url"></data-table-oi>
----------------------
kolonlar : [{name:"Konu",field:"konusu"},
            {name:"Tarihi",field:"rezerve_tarihi",sort:true},
            {name:"Başlama Saati",field:"baslama_saati", filter : 'filterName' }] => filterName global olarak tanımlanmış bir Vue.filter objesi olmalı.
                                                                                         Vue.filter('filterName', function(value){ return value+'...' }); //Şeklinde
resource_url: 'http://localhost:8080/Uygulama/rest/liste.json' => POST istek olmalı.
loadingImage : "./assets/img/loading.gif"
----------------------------------------------------------------------------------------
Dinamik istekler için backend yapısı
  - Gönderilecek İstek Yapısı
    	@RequestMapping(value="/liste.json",method=RequestMethod.POST)
      public ResponseEntity<ListNm> rezervasyonlistesi(
          @RequestParam(value = "page", required = false) String page,
          @RequestParam(value = "size", required = false) String size,   => Tek seferde kaç tane isteniyorsa (10)
          @RequestParam(value = "sort", required = false) String sort,
          @RequestParam(value = "sorttype", required = false) String sorttype,
          @RequestParam(value = "search", required = false) String search)
  - DönüşTipi (ListNm)
      public class ListNm {
          private String current_page;
          private String last_page;
          private String size;            =>tek seferde kaç tane gönderilecekse (10)
          private ArrayList<nDatam> data;
      }
------------------------------------------------------------------------------------------
Backend işlemleri için yardımcı olacak bir açıklama
     ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     || Integer totalCount = service.getTotalCount(search);
     || Integer pageCount = totalCount / size;
     || if(totalCount % size != 0) {
     ||     pageCount++;
     || }
     || listNm.setCurrent_page(page+"");
     || listNm.setLast_page(pageCount+"");
     || listNm.setSize(size+"");
     || ArrayList<nDatam> nm = service.getfindBySearch(size, page, sort, sorttype, search);
     || listNm.setData(nm);
     ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
------------------------------------------------------------------------------------------
Backend DB İşlemleri için yardımcı olacak bir açıklama
     ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     || public Integer getTotalCount(String search){
     ||    Query query;
     ||    if(search != null) {
     ||        query = sessionFactory.getCurrentSession().createNativeQuery("SELECT count(*) FROM tabloDBAdi WHERE active=:active AND "
     ||                    + "lower(fiedl1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
     ||                    + "lower(fiedl2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ")
     ||                    .setBoolean("active", true);
     ||    }else {
     ||        query = sessionFactory.getCurrentSession()
     ||                    .createNativeQuery("SELECT count(*) FROM tabloDBAdi WHERE active=:active")
     ||                    .setBoolean("active", true);
     ||    }
     ||    return Integer.parseInt(query.uniqueResult() + "");
     || }
     |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     || public ArrayList<nDatam> getfindBySearch(int limit,int page, String sort, String sorttype, String search) {
     || 		Query query;
     || 		if(sort == null) {
     || 			query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active ORDER BY id asc")
     || 				        .setBoolean("active", true);
     ||
     || 			if(search != null) {
     || 				query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active AND "
     || 								+ "lower(field1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
     || 								+ "lower(field2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ORDER BY id asc")
     || 						.setBoolean("active", true);
     || 			}
     || 		}else {
     || 			query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active ORDER BY "+sort+" "+sorttype)
     || 					    .setBoolean("active", true);
     ||
     || 			if(search != null) {
     || 				query = sessionFactory.getCurrentSession().createQuery("FROM nDatam WHERE active=:active AND "
     || 						        + "lower(field1) LIKE '%"+ StringUtils.lowerCase(search) +"%' OR "
     || 						        + "lower(field2) LIKE '%"+ StringUtils.lowerCase(search) +"%' ORDER BY "+sort+" "+sorttype)
     || 				        .setBoolean("active", true);
     || 			}
     || 		}
     || 		if(page != -1){
     || 			page--;
     || 			int size = page * limit;
     || 			query.setFirstResult(size);
     || 		}
     || 		query.setMaxResults(limit);
     || 		return (ArrayList<nDatam>) query.list();
     || }
     |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
