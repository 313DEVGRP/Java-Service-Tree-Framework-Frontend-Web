function execDocReady() {
    setSideMenu();
}

function setSideMenu() {
    setTimeout(function(){
        $('#sidebar_menu_dashboard').addClass("active");
        $('#sidebar_menu_dashboard').css({'color':'lightblue'});
    },1000);
}