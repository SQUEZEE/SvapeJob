$(document).ready(function(){
    var myNAME;
    var MYAVATAR;
    var MYNAME;
    
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
    async function getMyConcidences(){
        const response = await fetch("getMyConcidences",{
            method:"GET",
            headers:{"Accept":"application/json"}
        });
        if(response.ok){
            const content = await response.json();
            content.forEach(element => {
                $('.concidencesBlock').append(`<a href="portfolio.html?id=${element.Id}">
                <div class="concidenceBlock">
                    <div class="concidenceBcImage" style="background-image: url('img/worksImgs/${element.AvatarImg}');"></div>
                    <div class="name">${element.Name}</div>
                </div>
            </a>`);
            });
        }
    }
    getMyConcidences();
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
            
            getChats();
        }
    }
    getMyName();
    async function getChats(){
        const response = await fetch("getMyChats", {
            method: "GET",
            headers:{"Accept":"application/json"}
        });
        if(response.ok===true){
            const content = await response.json();
            console.log(content);
            content.forEach(async function(element){
                let recipientName;
                let recipientAvatar;
                let recipientProfession;
                let lastMessage;
                let id;
                if(element.firstParticipant==MYNAME){
                    id=element.secondParticipant;
                }else{
                    id=element.firstParticipant;
                }
                const response2 = await fetch(`getUserAvatar/${id}`, {
                    method: "GET",
                    headers: {"Accept": "application/json"}
                });
                if(response2.ok == true){
                    const content2 = await response2.json();
                    recipientAvatar = content2.avatar;
                    recipientName = content2.fullname;
                    recipientProfession = content2.profession;
                    
                }
                $('.mainRightChatList').append(`<a href="chat.html?recipient=${id}"><div class="chatBlock">
                <div class="avatar-Name-Proffesion-LastMsg">
                    <div class="avatar"><img src="img/worksImgs/${recipientAvatar}" alt=""></div>
                    <div class="name-Profession-LastMsg">
                        <div class="name-Profession">${recipientName} (${recipientProfession})</div>
                        <div class="lastMsg">${element.lastMessage}</div>
                    </div>
                </div>
                <div class="dateAndTime">
                    <div class="date"></div>
                    <div class="time"></div>
                </div>
            </div>
            <div class="line"></div></a>`);
            updateChatsImagesSizes();
            });
            
        }
    }
});