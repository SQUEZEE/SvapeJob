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
    var ROLE;
    async function getMyRole(){
        const response = await fetch("getMyRole",{
            method: "GET",
            headers: {"Accept":"application/json"}
        });
        if(response.ok){
            const content = await response.json();
            ROLE = content.role;
            if(ROLE=="organization"){

                $('.profileAbout .editBigInputBlock .editBigInputLabel').html("О нас:");
                $('.profileKeySkills .editBigInputBlock .editBigInputLabel').html("Мы предлагаем:");
                $('.educationAndSkillsBlock').css({"display":"none"});
                $('#profileWorksBlockForWorker').remove();
                $(document).on('click','.workBlock .cross', function(){
                    $(this).parent().remove();
                    updateWokrsBlockSize();
                });
            }else{
                $('#profileWorksBlockForOrganization').remove();
                $(document).on('click','.workBlock .cross', function(){
                    const Id = $(this).parent().attr("id").slice(4);
                    $(`input[name="work${Id}"]`).remove();
                    $(this).parent().remove();
                    updateWokrsBlockSize();
                });
            }
        }
    }
    getMyRole();
    function updateWokrsBlockSize(){
        if($('.profileWorksBlock').width() >= 790){
            
            $('.profileWorksBlock').height(60+((Math.ceil($('.workBlock').length/3))*$('.workBlock').height())+((Math.ceil($('.workBlock').length/3))*40));
            
        }else{
            if($('.profileWorksBlock').width() <= 600){
                $('.profileWorksBlock').height(60+ ($('.workBlock').length*$('.workBlock').height()+(Math.ceil($('.workBlock').length/1))*40));
                
            }else{
                if($('.profileWorksBlock').width() < 830){
                    $('.profileWorksBlock').height(60+ ((Math.ceil($('.workBlock').length/2))*$('.workBlock').height()+(Math.ceil($('.workBlock').length/2))*40));
                    
                }
            }
        }
    }
    function updateImgsSizes(){
        
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

    async function getPortfolio(){
        const response = await fetch("/getPortfolio", {
            method: "POST",
            headers: {"Accept":"application/json","Content-Type":"application/json"}
        });
        if(response.ok){
            const responseJson = await response.json();
            console.log(responseJson);
            $('.imgAndName input').val(responseJson.Profession);
            $('.imgAndName .editInputBlock input').val(responseJson.Name);

            /*($(this).attr('value')==responseJson.Profession){
                    professionIsCustom=false;
               }
            });
            if(professionIsCustom){
                $(`.imgAndName select option[value="Свое..."]`).prop('selected', true);
                $('.imgAndName input').val(responseJson.Profession);
            }else{
                $(`.imgAndName select option[value="${responseJson.Profession}"]`).prop('selected', true);
            }*/
            $('.profileAbout .editBigInputBlock textarea').val(responseJson.AboutUser);
            $('.profileKeySkills .editBigInputBlock textarea').val(responseJson.KeySkills);
            let iterations = 0;
            responseJson.Contacts.forEach(element => {
                iterations = iterations + 1;
                $('.socialsTable .tabelItems').append(`<div class="tableItem">
                <select id="socialInput-${iterations}">
                    <option disabled>Выберите соц-сеть</option>
                    <option value="VK">VK</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Twitter">Twitter</option>
                </select>
                <input value="${element.Link}" type="text">
                <img src="img/cross.png" class="cross">
            </div>`);
            $(`select#socialInput-${iterations} option[value="${element.SocialName}"]`).prop('selected', true);
            });
            $('.contactBtnWithInput .input input').val(responseJson.ContactBtnLink);
            if(ROLE=="organization"){
                responseJson.Vacancies.forEach(element => {
                    
                    $('#addVacancyBtn').before(`<div class="workBlock newWorkBlock">
                    <img src="img/cross.png" alt="" class="cross">
                    <div class="addWorkInputs">
                                                <div class="editBigInputBlock name">
                                                    <div class="editBigInputLabel">Название:</div>
                                                    <input value="${element.Name}" type="text">
                                                </div>
                                                <div class="editBigInputBlock education">
                                                    <div class="editBigInputLabel">Образование:</div>
                                                    <input value="${element.Education}" type="text">
                                                </div>
                                                <div class="editBigInputBlock experience">
                                                    <div class="editBigInputLabel">Опыт:</div>
                                                    <input value="${element.Experience}" type="text">
                                                </div>
                                                <div class="editBigInputBlock salary">
                                                    <div class="editBigInputLabel">З\П:</div>
                                                    <input value="${element.Salary}" type="text">
                                                </div>
                                            </div>
                </div>`);
                updateWokrsBlockSize();
                });
            }else{
                responseJson.Educations.forEach(element => {
                    $('#addEducationBtn').prev().append(`<div class="tableItem">
                    <input class="name" value="${element.EstablishmentName}" type="text">
                    <div class="line"></div>
                    <input class="profession" value="${element.Profession}" type="text">
                    <img src="img/cross.png" class="cross">
                </div>`);
                });
                responseJson.Skills.split(';').forEach(element => {
                    $('#addSkillBtn').prev().append(`<div class="tableItem">
                    <input value="${element}" type="text">
                    <img src="img/cross.png" class="cross">
                </div>`);
                });
                let iterations2 = 0;
                responseJson.Works.forEach(element => {
                    
                    $('#addWorkBtn').before(`<div class="workBlock" id="work${iterations2}">
    
                    <img src="img/cross.png" alt="" class="cross">
                    <a href="${element.WorkLink}">
                        <div class="workImgBlock">
                        <img src="img/worksImgs/${element.WorkImg}">
                        </div>
                        ${element.Name}</a>
    
                </div>`);
                iterations2 = iterations2+1;
                updateWokrsBlockSize();
                });
            }
            
            if(responseJson.AvatarImg!=""&&responseJson.AvatarImg!=null){
                $('#selectAvatar').css({'background':`url("img/worksImgs/${responseJson.AvatarImg}") 50% 50% / auto 100% no-repeat`});
            }
            setTimeout(updateImgsSizes, 200);
        }else{
            //document.location.href = document.location.protocol + "//" + document.location.host;
        }
    }
    getPortfolio();
    
    function getInputValue(selector){
        return $(selector).val();
    }
    $('.submitBtnEP').click(async function(){
        let Profession;
        let Skills = "";
        let Contacts = [];
        let Works = [];
        let Educations = [];
        let Vacancies = [];
        let AvatarImg;
        Profession = $('.imgAndName input[list="forFinderOptionList"]').val();
        $('.socialsTable .tabelItems .tableItem').each(function(index,val){
            Contacts[Contacts.length] = {
                name: $(this).children('select').val(),
                link: $(this).children('input').val()
            }
        });
        if(ROLE=="organization"){
            $('#profileWorksBlockForOrganization .worksBlockContent .workBlock').each(function(index,val){
                    Vacancies[Vacancies.length] = {
                        name: $(this).children('.addWorkInputs').children('.editBigInputBlock.name').children('input').val(),
                        education: $(this).children('.addWorkInputs').children('.editBigInputBlock.education').children('input').val(),
                        experience: $(this).children('.addWorkInputs').children('.editBigInputBlock.experience').children('input').val(),
                        employment: "",
                        salary: $(this).children('.addWorkInputs').children('.editBigInputBlock.salary').children('input').val()
                    }
                
            });
            Vacancies.pop();
        }else{
            $('#profileWorksBlockForWorker .worksBlockContent .workBlock').each(function(index,val){
                if($(this).attr('class')=="workBlock newWorkBlock"){
                    Works[Works.length] = {
                        idInClient: $(this).attr("id").slice(4),
                        img: "empty",
                        name: $(this).children('.addWorkInputs').children('.editBigInputBlock.name').children('input').val(),
                        link: $(this).children('.addWorkInputs').children('.editBigInputBlock.link').children('input').val()
                    }
                }else{
                    Works[Works.length] = {
                        idInClient: $(this).attr("id").slice(4),
                        img: $(this).children('a').children('.workImgBlock').children('img').attr('src').split('/')[$(this).children('img').attr('src').split('/').length],
                        name: $(this).children('a').html().split('>')[3],
                        link: $(this).children('a').attr('href')
                    }
                }
                
            });
            Works.pop();
            console.log(Works);
            $('.educationsTable .tabelItems .tableItem').each(function(index,val){
               Educations[Educations.length] = {
                    name: $(this).children('input.name').val(),
                    profession: $(this).children('input.profession').val()
                }
            });
            $('.skillsTable .tabelItems .tableItem').each(function(index, val){
                Skills = Skills + $(this).children('input').val() + ";";
            });
        }
        
        
       
        
        try {
            $('#selectAvatar').attr('style').split('background: url("img/worksImgs/')[1].split('")')[0];
        } catch (error) {
            AvatarImg = "empty";
        }
        if(AvatarImg != "empty"){
            let bcImg = $('#selectAvatar').attr('style').split('background: url("img/worksImgs/')[1].split('")')[0];
            AvatarImg = bcImg;
        }
        
        Skills.slice(0,-1);
        const response = await fetch("/portfolioSaveChanges",{
            method: "POST",
            headers:{"Accept":"application/json","Content-Type":"application/json"},
            body: JSON.stringify({
                name: getInputValue('.imgAndName .editInputBlock input'),
                aboutUser: getInputValue('.profileAbout .editBigInputBlock textarea'),
                avatarImg: AvatarImg,
                profession: Profession,
                keySkills: getInputValue('.profileKeySkills .editBigInputBlock textarea'),
                contactBtnLink: getInputValue('.contactBtnWithInput .input input'),
                skills: Skills.slice(0,-1),
                contacts: Contacts,
                works: Works,
                educations:Educations,
                vacancies: Vacancies
            })
        });
        if(response.ok){
                if(AvatarImg!='empty'){
                    $('input[name="avatar"]').remove();
                }
                var formData = new FormData($('form')[0]);
                $.ajax({
                  url: '/uploadPortfolioImgs',
                  method: 'POST',
                  data: formData,
                  async: false,
                  cache: false,
                  contentType: false,
                  processData: false,
                  success: function (returndata) {
                    alert(`Изменения внесены.`);
                  },
                  error: (returndata) => {
                    alert(`Ошибка, попробуйте позже.`);
                    }
                });
               
                return false;
              
        }
    });
    $('#selectAvatar').click(function(){
        $('#selectAvatarInput').click();
    });
    $(document).on('click','#addVacancyBtn', function(){
        $(this).remove();
        $('#profileWorksBlockForOrganization .worksBlockContent').append(`<div class="workBlock newWorkBlock">
        <img src="img/cross.png" alt="" class="cross">
        <div class="addWorkInputs">
                                    <div class="editBigInputBlock name">
                                        <div class="editBigInputLabel">Название:</div>
                                        <input type="text">
                                    </div>
                                    <div class="editBigInputBlock education">
                                        <div class="editBigInputLabel">Образование:</div>
                                        <input type="text">
                                    </div>
                                    <div class="editBigInputBlock experience">
                                        <div class="editBigInputLabel">Опыт:</div>
                                        <input type="text">
                                    </div>
                                    <div class="editBigInputBlock salary">
                                        <div class="editBigInputLabel">З\П:</div>
                                        <input type="text">
                                    </div>
                                </div>
    </div>
    <div class="workBlock newWorkBlock" id="addVacancyBtn">
        <div class="addImageBtn">
            Добавить вакансию
            <img src="img/plus.png" alt="">
        </div>
    </div>`);
    updateWokrsBlockSize();
    });
    $(document).on('click','#addWorkBtn', function(){
        let index;
        let Id;
        if($('.workBlock').length-1){
            index =$('.workBlock').length-2;
            Id = parseInt($(`.workBlock:eq(${index})`).attr('id').slice(4)) + 1;
        }else{
            index=0;
            Id=0;
        }

        console.log(index);
        $(this).remove();
        $('#profileWorksBlockForWorker .worksBlockContent').append(`<div id="work${Id}" class="workBlock newWorkBlock">
        <img src="img/cross.png" alt="" class="cross">
        <div class="addImageBtn">
            Загрузить фото
            <img src="img/upload.png" alt="">
        </div>
        <div class="addWorkInputs">
                                    <div class="editBigInputBlock name">
                                        <div class="editBigInputLabel">Название:</div>
                                        <input type="text">
                                    </div>
                                    <div class="editBigInputBlock link">
                                        <div class="editBigInputLabel">Ссылка:</div>
                                        <input type="text">
                                    </div>
                                </div>
    </div>
    <div class="workBlock newWorkBlock" id="addWorkBtn">
        <div class="addImageBtn">
            Добавить работу
            <img src="img/plus.png" alt="">
        </div>
    </div>`);
    $('form').append(`<input type="file" name="work${Id}" />`);
    updateWokrsBlockSize();
    });
    
    $(document).on('click','.workBlock .addImageBtn', function(){
        
        const Id = $(this).parent().attr("id").slice(4);
        $(`input[name="work${Id}"]`).click();
    });
    
    
    
    $('#addSocialBtn').click(function(){
        $(this).prev().append(`<div class="tableItem">
        <select>
            <option disabled>Выберите соц-сеть</option>
            <option value="VK">VK</option>
            <option value="Facebook">Facebook</option>
            <option value="Telegram">Telegram</option>
            <option value="GitHub">GitHub</option>
            <option value="Twitter">Twitter</option>
        </select>
        <input type="text">
        <img src="img/cross.png" class="cross">
    </div>`);
    });
    $(document).on('click','.createContactInputBlock .cross', function(){
        $(this).parent().remove();
    });
    $(document).on('click','.tableItem .cross', function(){
        $(this).parent().remove();
    });
    $('#addEducationBtn').click(function(){
        $(this).prev().append(`<div class="tableItem">
        <input class="name" type="text">
        <div class="line"></div>
        <input class="profession" type="text">
        <img src="img/cross.png" class="cross">
    </div>`);
    });
    $('#addSkillBtn').click(function(){
        $(this).prev().append(`<div class="tableItem">
        <input type="text">
        <img src="img/cross.png" class="cross">
    </div>`);
    });
    $('.imgAndName select').click(function(){
        if($(this).val()=="Свое..."){
            $(this).parent().children('input').css({"display":"block"});
        }else{
            $(this).parent().children('input').css({"display":"none"});
        }
    });
    $('input[name="avatar"]').change(function(){
        $('#selectAvatar').css({'background-image':`none`,'background':'#727272'})
    });
    
});