$(document).ready(function(){
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
    function updateChatsImagesSizes(){
        
        document.querySelectorAll('.chatBlock').forEach(element => {
            element.querySelector('.avatar-Name-Proffesion-LastMsg .avatar img').onload=function(){
                $img = $(element).children('.avatar-Name-Proffesion-LastMsg').children('.avatar').children('img');
                console.log($img.attr('src'));
                if($img.height()>=$img.width()){
                    $img.css({"width":"100%"});
                }else{
                    $img.css({"height":"100%"});
                }
            };
        });
        
    }
    async function getMyGuests(){
        const response = await fetch("getMyGuests", {
            method: "GET",
            headers: {"Accept": "application/json"}
        });
        if(response.ok === true){
            const content = await response.json();
            console.log(content);
            content.forEach(async function(element) {
                const getProtfolio = await fetch(`getPortfolioForUser/${element.GuestName}`, {
                    method: "GET",
                    headers: {"Accept":"application/json"}
                });
                if(getProtfolio.ok === true){
                    const portfolio = await getProtfolio.json();
                    $('.mainRightChatList').append(`<a href="portfolio.html?id=${portfolio.Id}"><div class="chatBlock">
            <div class="avatar-Name-Proffesion-LastMsg">
                <div class="avatar"><img src="img/worksImgs/${portfolio.AvatarImg}" alt=""></div>
                <div class="name-Profession-LastMsg">
                    <div class="name-Profession">${portfolio.Name} (${portfolio.Profession})</div>
                </div>
            </div>
            <div class="dateAndTime">
                <div class="date"></div>
                <div class="time"></div>
            </div>
        </div>
        <div class="line"></div></a>`);
                }
                updateChatsImagesSizes();
            });
            updateChatsImagesSizes();
        }
    }
    getMyGuests();
});