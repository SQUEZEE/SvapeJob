$(document).ready(async function(){
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
$('.mainRight.mainItem').css({"height":`${window.innerHeight-220}px`});
async function isLogin(){
    const response = await fetch("api/getUserInfo",{
        method:"GET",
        headers: {"Accept":"application/json"}
    });
    if(response.ok === true){
        const user = await response.json();
        console.log(user);
    }else{
        
    }
}
isLogin();
    var myNAME;
    var recipientNAME
    var MYNAME;
    var MYAVATAR;
    var RECIPIENTAVATAR;
    async function getMessages(){
        const response = await fetch(`/getMessages/${params['recipient']}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        if(response.ok===true){
            const content = await response.json();
            content.forEach(element => {
                let avatar;
                let name;
                if(element.Sender == MYNAME){
                    avatar = MYAVATAR;
                    name = myNAME;
                }else{
                    avatar = RECIPIENTAVATAR;
                    name = recipientNAME;
                }
                $('.chatMsgs').append(`<div class="chatMsg">
            <div class="avatar"><img src="img/worksImgs/${avatar}" alt=""></div>
            <div class="nameAndMessage">
                <div class="name">${name}</div>
                <div class="message">${element.Content}</div>
            </div>
        </div>`);
            });
            $('.chatMsg').each(function(){
                $img = $(this).children('.avatar').children('img');
                if($img.height()>=$img.width()){
                    $img.css({"width":"100%"});
                }else{
                    $img.css({"height":"100%"});
                }
            });
            document.querySelector('.chatMsgs').scrollTop = 1e9;
        }
    }
    function updateImgsSizes(){
        
        if($('.mainLeftHeaderUserInfo .avatar img').height()>=$('.mainLeftHeaderUserInfo .avatar img').width()){
            $('.mainLeftHeaderUserInfo .avatar img').css({"width":"100%"});
        }else{
            $('.mainLeftHeaderUserInfo .avatar img').css({"height":"100%"});
        }
    }
    async function getRecipientAvatar(){
        const response = await fetch(`getUserAvatar/${params['recipient']}`, {
            method: "GET",
            headers: {"Accept": "application/json"}
        });
        if(response.ok == true){
            const content = await response.json();
            RECIPIENTAVATAR = content.avatar;
            recipientNAME = content.fullname;
            $('.chatHeader .name-Profession .profession').html(content.profession);
            $('.chatHeader .avatar img').attr("src", `img/worksImgs/${content.avatar}`)
            $('.chatHeader .name-Profession .name').html(content.fullname);
            $('.chatHeader .avatar img')[0].onload = function(){
                $img = $('.chatHeader .avatar img');
                if($img.height()>=$img.width()){
                    $img.css({"width":"100%"});
                }else{
                    $img.css({"height":"100%"});
                }
            }
        }
        getMessages();
        updateImgsSizes();
    }
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
        getRecipientAvatar();
    }
    
    
    getMyName();
    const hubConnection = new signalR.HubConnectionBuilder().withUrl("/chat").build();
            $('.sendMessageInput input').keyup(function(event) {
                console.log(event.which);
                if (event.which === 13) {
                    $('.sendMessageBtn').click();
                }
            });

    $('.sendMessageBtn').click(async function(){

            const sender = "empty";
            const recipient = params['recipient'];
            const content = $('.sendMessageInput input').val();
            const response = await fetch(`/sendMessage/${recipient}/${sender}/${content}`,{
                method: "GET",
                headers:{"Accept": "application/json"}
            });
            if(response.ok==true){
                $('.sendMessageInput input').val("");
            }
    });
    hubConnection.on("Receive", function (sender, recipient, content) {
        let avatar;
        let name;
        if(sender == MYNAME){
            avatar = MYAVATAR;
            name = myNAME;
        }else{
            avatar = RECIPIENTAVATAR;
            name = recipientNAME;
        }
        if(sender == MYNAME && recipient == params['recipient']||recipient==MYNAME&&sender==params['recipient']){
            $('.chatMsgs').append(`<div class="chatMsg">
            <div class="avatar"><img src="img/worksImgs/${avatar}" alt=""></div>
            <div class="nameAndMessage">
                <div class="name">${name}</div>
                <div class="message">${content}</div>
            </div>
        </div>`);
        $('.chatMsg').last().children('.avatar').children('.img')[0].onload = function(){
            $('.chatMsg').each(function(){
                $img = $(this).children('.avatar').children('img');
                if($img.height()>=$img.width()){
                    $img.css({"width":"100%"});
                }else{
                    $img.css({"height":"100%"});
                }
            });
        }
        
        document.querySelector('.chatMsgs').scrollTop = 1e9;
        } 
    });
                        hubConnection.start()
                       .then(function () {
                           //document.getElementById("sendBtn").disabled = false;
                       })
                       .catch(function (err) {
                           return console.error(err.toString());
                       });
    
});