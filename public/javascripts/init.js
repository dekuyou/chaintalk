$(function(){
    i18n.init({ lng: browserLanguage() }, function(t) {
        // translate nav
        $(".nav").i18n();
    
        // programatical access
        console.log(t("app.name"));

        $('*').i18n();
        
        try{
            i18n._callback(t);    
        } catch(e){
        
        }
    });
    
});

function browserLanguage() {
  try {
    return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2)
  }
  catch(e) {
    return undefined;
  }
}