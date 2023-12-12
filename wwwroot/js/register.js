$(document).ready(function(){
    function formError(){
        console.log('error');
    }
    $('#emailConfirmationBtn').click(async function(){
        
        $(this).html(``);
        $('.loadingLayer').css({'display':'flex'});
        const email = document.querySelector('#emailInput').value;
        const password = document.querySelector('#passwordInput').value;
        const login = document.querySelector('#loginInput').value;
        const experience = document.querySelector('#experienceInput').value;
        const userName = document.querySelector('#userNameInput').value;
        const forFinderOption = document.querySelector('#forFinderOptionInput').value;
        const findOption = document.querySelector('#findOptionInput').value;
        let finderRole;
        let dateOfBirth;
        if($('.formItem.active').parent().attr("class")=="registerItemsForWorker"){
            dateOfBirth = document.querySelector('#dateOfBirthInput').value;
            finderRole = "worker";
        }else{
            dateOfBirth = "";
            finderRole = "organization";
        }
        const code = document.querySelector('#emailConfirmationInput').value;

        const response = await fetch('api/endEmailConfirmation', {
            method:"POST",
            headers: {"Accept":"application/json", "Content-Type":"application/json"},
            body: JSON.stringify({
                Id: ID,
                Login: login,
                Password: password,
                Email: email,
                Code: code,
                DateOfBirth: dateOfBirth,
                FinderRole: finderRole,
                UserName: userName,
                Experience: experience,
                FindOption: findOption,
                ForFinderOption: forFinderOption
            })
        });
        if(response.ok === true){
            $(this).html(`Подтвердить`);
            $('.loadingLayer').css({'display':'none'});
            document.location.href = document.location.protocol + "//" + document.location.host + "/login.html";
        }else{
            formError();
            $(this).html(`Подтвердить`);
        }
    });
    $(document).on('click','#loginBtn',async function(){
        console.log("click");
        $(this).html(``);
        $('.loadingLayer').css({'display':'flex'});
        const email = document.querySelector('#emailInput').value;
        const password = document.querySelector('#passwordInput').value;
        const login = document.querySelector('#loginInput').value;
        if(!email.includes('@') || password.length<8 || login.length<5){
            formError();
            console.log('im there');
            console.log(email+" "+password+" "+login)
            $(this).html(`Зарегистрироваться`);
            $('.loadingLayer').css({'display':'none'});
        }else{
            console.log("confirmationStarted");
            const response = await fetch(`api/startEmailConfirmation/${email}`,{
                method:"GET",
                headers:{"Accept":"application/json"}
            });
            if(response.ok===true){
                $(this).html(`Зарегистрироваться`);
                const responseJson = await response.json();
                console.log(responseJson);
                ID = responseJson.id.toString();
                $('#fullRegisterBlock').css({"display":"none"});
                $('#emailConfirmationBlock').css({"display":"block"});
                $(this).html(`Зарегистрироваться`);
            $('.loadingLayer').css({'display':'none'});
            }else{
                formError();
                $(this).html(`Зарегистрироваться`);
            $('.loadingLayer').css({'display':'none'});
            }
        }
    });

    $("#registerForWorker, #registerForOrganization").click(function(){
        $(".formNAvigationBtns").css({"display":"flex"});
        $('.selectRoleBlock').parent().css({"display":"none"});
        if($(this).attr("id").split("For")[1]=="Worker"){
            $('.registerItemsForWorker').css({"display":"block"});
            $('.registerItemsForWorker').children("#formItem-1").attr("class", "formItem active");
            $('.registerItemsForOrganization').remove();
        }else{
            $('.registerItemsForWorker').remove();
            $('.registerItemsForOrganization').css({"display":"block"});
            $('.registerItemsForOrganization').children("#formItem-1").attr("class", "formItem active");
        }
    });
    $('.formNAvigationBtn').click(function(){
        const id = $(".formItem.active").attr("id").split('-')[1];
        console.log($(this).attr("class").split(' ')[1]);
        if($(this).attr("class").split(' ')[1]=="back"){
            if(id!="1"){
                console.log(`#formItem-${parseInt(id)-1}`);
                $(`.formItem.active`).attr("class", "formItem");
                $(`#formItem-${parseInt(id)-1}`).attr("class", "formItem active");
            }else{
                location. reload();
            }
        }else{
            const activeBlock = $(".formItem.active").parent().attr("class");
            console.log($(`.${activeBlock} .formItem`).length);
            console.log(id);
            if($(`.${activeBlock} .formItem`).length!=id){
                console.log(`#formItem-${id}`);
                $(`.formItem.active`).attr("class", "formItem");
                $(`#formItem-${parseInt(id)+1}`).attr("class", "formItem active");
            }
        }
        
    });
});