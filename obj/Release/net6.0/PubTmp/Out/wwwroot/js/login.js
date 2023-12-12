$(document).ready(function(){
    function formError(){
        console.log('error');
    }
    $('#loginBtn').click(async function(){
        $(this).html(``);
        $('.loadingLayer').css({'display':'flex'});
        const password = document.querySelector('#passwordInput').value;
        const loginOrEmail = document.querySelector('#loginOrEmailInput').value;
        if(password.length<8){
            formError();
            $(this).html(`Войти`);
            $('.loadingLayer').css({'display':'none'});
        }else{
            const response = await fetch('api/loginUser',{
                method:"POST",
                headers:{"Accept":"application/json", "Content-Type":"application/json"},
                body: JSON.stringify({
                    loginOrEmail: loginOrEmail,
                    password: password
                })
            });
            if(response.ok===true){
                $(this).html(`Войти`);
            $('.loadingLayer').css({'display':'none'});
                document.location.href = document.location.protocol + "//" + document.location.host;
                
            }else{
                formError();
                $(this).html(`Войти`);
            $('.loadingLayer').css({'display':'none'});
            }
        }
    });
});