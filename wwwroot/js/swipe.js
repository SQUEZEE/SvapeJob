$(document).ready(function(){
    var ROLE;
    async function getMyRole(){
        const response = await fetch("getMyRole",{
            method: "GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok){
            const content = await response.json();
            ROLE = content.role;
        }
    }
    getMyRole();
    async function getMyName(){
        const response = await fetch("/getMyClaim",{
            method: "GET",
            headers: {"Accept": "application/json"}
        });
        if(response.ok===true){
            const content = await response.json();
            MYNAME = content.name;
            MYAVATAR = content.avatar;
            myNAME = content.fullname;
            $('.mainLeftHeaderUserInfo .avatar img').attr("src", `img/worksImgs/${content.avatar}`);
            $('.mainLeftHeaderUserInfo .nameAndProfession .name').html(content.fullname);
            $('.mainLeftHeaderUserInfo .nameAndProfession .profession').html(content.profession);
            document.querySelector('.mainLeftHeaderUserInfo .avatar img').onload=function(){
                if($('.mainLeftHeaderUserInfo .avatar img').height()>=$('.mainLeftHeaderUserInfo .avatar img').width()){
                    $('.mainLeftHeaderUserInfo .avatar img').css({"width":"100%"});
                }else{
                    $('.mainLeftHeaderUserInfo .avatar img').css({"height":"100%"});
                }
            };
        }
    }
    getMyName();
    $(`.swipeSlider`).slick({
        arrows: false,
        initialSlide: 1
    });
    function reloadSwipeSlider(){
        $('.swipeSlider').slick('unslick');
        $(`.swipeSlider`).slick({
            arrows: false,
            initialSlide: 1
        });
    }
    $(`.swipeSlider`).on('swipe',async function(event, slick, direction){
        if(direction=="right"){
            await fetch(`likeSwipe/${$(".swipeSlider").attr("id")}`,{
                method:"GET",
                headers: {"Accept":"application/json"}
            });
            
        }
        
        getNextSlide();
        setTimeout(reloadSwipeSlider, 500);
    });
    
    async function getNextSlide(){
        const response = await fetch(`getNextSwipe`, {
            method:"GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok){
            const content = await response.json();
            console.log(content);
            console.log(typeof content.message);
            if(typeof content.message!="string"){
                const getRole = await fetch(`getFinderRoleByPortfolioId/${content.Id}`, {
                    method:"GET",
                    headers:{"Accept": "application/json"}
                });
                const RoleOfSwipe = await getRole.json();
                $('.mainRight.mainItem').animate({opacity:0});
            
                $('.mainRightBcImage').css({"background-image":`url("../img/worksImgs/${content.AvatarImg}")`});
                $('.mainRight.mainItem').animate({opacity:1});
                    let keySkillsLabel;
                    let aboutUserLabel;
                    if(RoleOfSwipe.finderRole=="organization"){
                        keySkillsLabel = "Мы предлагаем:";
                        aboutUserLabel = "О нас:";
                    }else{
                        keySkillsLabel = "Ключевые навыки:";
                        aboutUserLabel = "О себе:";
                    }
                    $('.swipeSlider').attr("id", content.IdOwner);
                    $('.swipeImgBlock').children('img').attr('src', `img/worksImgs/${content.AvatarImg}`);
                    $('.mainRightSwipe').children('.userNameBlock').children('.name').html(content.Name);
                    $('.mainRightSwipe').children('.userNameBlock').children('.profession').html(content.Profession);
                    $('.name.dropUpContentItem').html(content.Name);
                    $('.keySkills.dropUpContentItem').html(`<div class="label">
                    ${keySkillsLabel}
                </div>
                ${content.KeySkills}`);
                    $('.aboutUser.dropUpContentItem').html(`<div class="label">
                    ${aboutUserLabel}
                </div>
                ${content.AboutUser}`);
                    /*$('.mainRightSwipeContent').append(`<div class="swipeSlider" id="${content.IdOwner}">
                    <div class="swipeSliderSlide"></div>
                    <div class="swipeSliderSlide look">
                        <div class="mainRightSwipe">
                            <div class="swipeImgBlock"><img src="img/worksImgs/${content.AvatarImg}" alt=""></div>
                            <div class="userNameBlock">
                                <div class="name">${content.Name}</div>
                                <div class="profession">${content.Profession}</div>
                            </div>
                            <div class="btnsBlock">
                                <div class="denyBtn">
                                    <img src="img/denyBtn.png" alt="">
                                </div>
                                <div class="acceptBtn">
                                    <img src="img/acceptBtn.png" alt="">
                                </div>
                            </div>
                            <div class="dropUpMenu">
                                <div class="dropUpBtn"><img src="img/backImg.png" alt=""></div>
                                <div class="dropUpContent" style="display:none">
                                    <div class="name dropUpContentItem">
                                    ${content.Name}
                                    </div>
                                    <div class="keySkills dropUpContentItem">
                                        <div class="label">
                                            ${keySkillsLabel}
                                        </div>
                                        ${content.KeySkills}
                                    </div>
                                    <div class="aboutUser dropUpContentItem">
                                        <div class="label">
                                            ${aboutUserLabel}
                                        </div>
                                        ${content.AboutUser}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="swipeSliderSlide"></div>
                </div>`);*/
            
            }else{
                $('.swipeSlider').remove();
                let word;
                if(ROLE=="organization"){
                    word = "всех соискателей.";
                }else{
                    word = "все организации.";
                }
                $('.mainRightSwipeContent').html(`Вы просмотрели ${word}`);
                $('.mainRightSwipeContent').css({
                    "font-size":"20px",
                    "text-align":"center",
                    "display":"flex",
                    "align-items":"center",
                    "justify-content":"center",
                    "color":"white",
                    "padding":"20px"


                });
            }
            
        
        }
    }
    getNextSlide();
    $('.mainRight.mainItem').css({"height":`${window.innerHeight-240}px`});
    $(document).on('click','.dropUpBtn', function(){
        $('.dropUpContent').slideToggle();
        $(this).children('img').toggleClass("rotate");
    });
});