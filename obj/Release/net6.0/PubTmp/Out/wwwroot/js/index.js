$(document).ready(function(){
    var params = window
    .location
    .search
    .replace('?', '')
    .split('&')
    .reduce(
        function (p, e) {
            var a = e.split('=');
            p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
);
    async function isLogin(){
        const response = await fetch("api/getUserInfo",{
            method:"GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok === true){
            const user = await response.json();
            if(document.location.href==document.location.protocol + "//" + document.location.host + "/index.html"
            ||document.location.href==document.location.protocol + "//" + document.location.host+"/"
            ||document.location.href==document.location.protocol + "//" + document.location.host)
            {
                if(params['redirect']!="redirect"){
                    document.location.href=document.location.protocol + "//" + document.location.host + "/chats.html";
                }
                
            }
            $('.profileControlBtn').css({'display':'none'});
            $('.profileControlLine').css({'display':'none'});
            $('.logining').css({'display':'block'});

            $('.formBtn.mobileMenuBtn.submitBtn').html('Мое портфолио');
            $('.formBtn.mobileMenuBtn.submitBtn').parent().attr("href", "portfolioEditor.html");
            $('.formBtn.mobileMenuBtn.cancelBtn').html('Выйти');
            $('.formBtn.mobileMenuBtn.cancelBtn').parent().attr("href", "logout");

            //$('#linkToPortfolioEditor').attr("href", `portfolioEditor.html?ID=${user.id}`);
        }else{
            
        }
    }
    isLogin();
    function adaptElements(){
        if(window.innerHeight<window.innerWidth){
            $(".mainVideo").css({"width": "100%","height": "auto"});
        }
        if(window.innerHeight<window.innerWidth){
            $(".profileBg img").css({"width": "100%","height": "auto"});
        }
        if(window.innerHeight<550){
                $(".main-with-video").height(486);
        }else{
            if(window.innerWidth<=767){
                $(".main-with-video").height(window.innerHeight-64);
                
            }else{
                $(".main-with-video").height(window.innerHeight-112);
            }
        }
        
    }
    adaptElements();

   
    
    

    $(".industryBlockIndustry").mouseenter(function(){
        $(this).children("img").animate({opacity:"0.4"},250);
        $(this).children(".visualBtn").children(".showText").slideToggle(250, "swing");
    }).mouseleave(function(){
        $(this).children("img").animate({opacity:"1"},250);
        $(this).children(".visualBtn").children(".showText").slideToggle(250, "swing");
    });
    $('.burgerMenu').click(function(){
        $('.burgerDropDown').slideToggle(150,"swing",function(){
            $('.burgerDropDown').css({"height":`${document.documentElement.clientHeight - 46}px`});
        });
        
        $('.mainMain').toggleClass('nonVisible');
        $('.containerTabBar').toggleClass('nonVisible');
        $(this).toggleClass('active');
        $('body').toggleClass('lock');
        
    });
});