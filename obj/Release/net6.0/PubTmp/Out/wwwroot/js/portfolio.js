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

    const ID = params["id"];
    var ROLE;
    
    
    function updateWokrsBlockSize(){
        console.log($('.profileWorksBlock').width());
        if($('.profileWorksBlock').width() >= 795){
            console.log(90 + ((Math.ceil($('.workBlock').length/3))*$('.workBlock').height())+((Math.ceil($('.workBlock').length/3))*40));
            $('.profileWorksBlock').height(90 + ((Math.ceil($('.workBlock').length/3))*$('.workBlock').height())+((Math.ceil($('.workBlock').length/3))*40));
            
        }else{
            if($('.profileWorksBlock').width() <= 600){
                $('.profileWorksBlock').height(110 + (Math.ceil($('.workBlock').length/1))*$('.workBlock').height()+(Math.ceil($('.workBlock').length/3))*40);
                
            }else{
                if($('.profileWorksBlock').width() < 830){
                    $('.profileWorksBlock').height(90 + (Math.ceil($('.workBlock').length/2))*$('.workBlock').height()+(Math.ceil($('.workBlock').length/3))*40);
                    
                }
            }
        }
    }
    function updateImgsSizes(){
        if($('.profileBlock .imgBlock img').height()>=$('.profileBlock .imgBlock img').width()){
            $('.profileBlock .imgBlock img').css({"width":"100%"});
        }else{
            $('.profileBlock .imgBlock img').css({"height":"100%"});
        }
        $('.workBlock a .workImgBlock img').each(function(index, element){
            if($(this).height()>=$(this).width()){
                console.log(`width`);
                $(this).css({"width":"100%"});
            }else{
                $(this).css({"height":"100%"});
                console.log(`height`);
            }
        });
    }
    updateWokrsBlockSize();
    async function isLogin(id){
        const response = await fetch("api/getUserInfo",{
            method:"GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok === true){
            getUserEmail(id);
        }else{
            $('.profileContactsBlock a .contactBtn').parent().attr('href', `login.html`);
        }
    }
    async function getFinderRole(){
        const response = await fetch(`getFinderRoleByPortfolioId/${params["id"]}`, {
            method: "GET",
            header: {"Accept":"application/json"}
        });
        if(response.ok){
            const content = await response.json();
            ROLE = content.finderRole;
            if(ROLE=="organization"){
                $('.profileAbout .editBigInputBlock .editBigInputLabel').html("О нас:");
                $('.profileKeySkills .editBigInputBlock .editBigInputLabel').html("Мы предлагаем:");
                $('.imgAndName .editInputBlock .editInputLabel').html("Название:");
                $('.educationAndSkillsBlock').css({"display":"none"});
                $('.profileWorksBlock .worksBlockBg .label').html("Вакансии:")
            }else{
                
            }
            getPorfolio();
        }
    }
    getFinderRole();
    async function getUserEmail(id){
        const response = await fetch(`getUserEmail/${id}`,{
            method: "GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok===true){
            const content = await response.json();
            $('.profileContactsBlock a .contactBtn').parent().attr('href', `chat.html?recipient=${content.email}`);
            
        }
    }
    async function getPorfolio(){
        const response = await fetch(`/getPortfolioForUser/${ID}`, {
            method: "GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok){
            if(window.innerWidth<767){
                $('.profileContactsBlock').remove();
                $(".rightBlock").append(`<div class="profileContactsBlock">
                <div class="label">Контакты:</div>
                <div class="profileSocialsBlock"></div>
                <a href="">
                    <div class="contactBtn">Связаться &gt;</div>
                </a>
                
            </div>`)
            }
            const responseJson = await response.json();
            console.log(responseJson);
            isLogin(responseJson.IdOwner);
            $('.profileBlock .imgBlock img').attr("src", `img/worksImgs/${responseJson.AvatarImg}`);
            $('.imgAndName .profileName').html(responseJson.Name);
            $('.imgAndName .Profession').html(responseJson.Profession);
            if(ROLE == "organization"){
                $('.profileAbout').html(`<div class="label">О нас:</div>${responseJson.AboutUser}`);
                $('.profileKeySkills').html(`<div class="label">Мы предлагаем:</div>${responseJson.KeySkills}`);
                responseJson.Vacancies.forEach(element => {
                    $('.worksBlockContent').append(`<div class="workBlock vacancyBlock">
                    <div class="name">${element.Name}</div>
                    <div class="points">
                        <div class="point">
                            <div class="label">Образование:</div>
                            <div class="value">${element.Education}</div>
                        </div>
                        <div class="point">
                            <div class="label">Опыт работы:</div>
                            <div class="value">${element.Experience}</div>
                        </div>
                        <div class="point">
                            <div class="label">З/П: </div>
                            <div class="value">${element.Salary}</div>
                        </div>
                    </div>
                    
                </div>`);
                });
            }else{
                $('.profileAbout').html(`<div class="label">О себе:</div>${responseJson.AboutUser}`);
                $('.profileKeySkills').html(`<div class="label">Ключевые навыки:</div>${responseJson.KeySkills}`);
                let iterations = 0;
            responseJson.Works.forEach(element => {
                $('.worksBlockContent').append(`<div class="workBlock" id="work${iterations}">
                <a href="${element.WorkLink}">
                    <div class="workImgBlock">
                    <img src="img/worksImgs/${element.WorkImg}">
                    </div>
                    ${element.Name}</a>
            </div>`);
            iterations = iterations + 1;

            });
            responseJson.Educations.forEach(element => {
                $('.educationBlock').append(`<div class="profileEducation">
                <img src="img/education.png" alt="">${element.EstablishmentName}</div>
            <div class="educationProfession">Специальность: ${element.Profession}</div>`);
            });
            responseJson.Skills.split(";").forEach(element => {
                $('.skillsBlock .skills').append(`<li class="skill">${element}`);
            });
            }
            
            
            responseJson.Contacts.forEach(element => {
                let socialImg;
                switch(element.SocialName){
                    case "VK":
                        socialImg = "vk-social.png"
                        break;
                    case "Facebook":
                        socialImg = "fb-social.png"
                        break;
                    case "Telegram":
                        socialImg = "tg-social.png"
                        break;
                    case "GitHub":
                        socialImg = "gh-social.png"
                        break;
                    case "Twitter":
                        socialImg = "twitter-social.png";
                        break;
                }
                $(".profileSocialsBlock").append(`<div class="profileSocial">

                <a href="${element.Link}">
                    <img src="img/${socialImg}">
                </a>
                
            </div>`);
            });
            
            
            updateWokrsBlockSize();
            setTimeout(updateImgsSizes, 200);
        }
    }
    
    
    
    async function registerGuest(){
        const response = await fetch(`registerGuest/${params['id']}`,{
            method: "GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok===true){
            
        }
    }
    registerGuest();
});