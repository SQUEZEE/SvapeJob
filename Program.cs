using Folio;
using Folio.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using MimeKit;
using MimeKit.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Org.BouncyCastle.Asn1.Ocsp;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Cms;
using System.Xml.Linq;
using System;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = AuthOptions.ISSUER,
            ValidateAudience = true,
            ValidAudience = AuthOptions.AUDIENCE,
            ValidateLifetime = true,
            IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(),
            ValidateIssuerSigningKey = true
        };
    });

string connection = "Data Source=SQL5111.site4now.net;Initial Catalog=db_aa2902_svapejobdb;User Id=db_aa2902_svapejobdb_admin;Password=SvapeJobEbat1488";
//string connection = "Server=(localdb)\\mssqllocaldb;Database=ffoolliioodb;Trusted_Connection=True;";
builder.Services.AddDbContext<ApplicationContext>(options => options.UseSqlServer(connection));
builder.Services.AddSignalR();
var app = builder.Build();


app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSession();
app.UseMiddleware<JwtMiddleware>();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("setEmail/{mail}/{pass}", async (string mail, string pass,ApplicationContext db) =>
{
    Email? isExist = await db.emails.FirstOrDefaultAsync(e => e.Id == 1);
    if(isExist == null)
    {
        Email newEmail = new Email() {Mail= mail, Password=pass};
        await db.emails.AddAsync(newEmail);
        await db.SaveChangesAsync();
    }
    else
    {
        isExist.Password = pass;
        isExist.Mail = mail;
        await db.SaveChangesAsync();
    }
});
app.MapGet("nulled", async (ApplicationContext db) =>
{
    List<User> users = await db.Users.ToListAsync();
    foreach(var user in users)
    {
        user.LikedBy = "";
        user.viewedSwipes = "";
    }
    await db.SaveChangesAsync();
});


app.MapGet("getMyConcidences", [Authorize] async (ApplicationContext db, HttpContext context) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        List<Portfolio> result = new List<Portfolio>();
        
        string[] likedBy = user.LikedBy.Split(';');
        if(likedBy.Length > 0)
        {
            foreach (string s in likedBy)
            {
                User? userFind = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == s);
                if (userFind is not null)
                {
                    foreach (string s2 in userFind.LikedBy.Split(';'))
                    {
                        if (s2 == user.Id.ToString())
                        {
                            Portfolio? portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == s);
                            result.Add(portfolio);
                        }
                    }
                }
                
            }
            string json = JsonConvert.SerializeObject(result, Formatting.Indented,
                        new JsonSerializerSettings()
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json";
            await response.WriteAsync(json);
        }
        
    }
    else
    {

    }
});

app.MapGet("likeSwipe/{id}", [Authorize] async (string id, ApplicationContext db, HttpContext context) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    { 
        User? getLikedUser = await db.Users.FirstOrDefaultAsync(u=>u.Id.ToString()==id);
        if(getLikedUser is not null)
        {
        if (getLikedUser.LikedBy == "" || getLikedUser.LikedBy == null)
            {
                getLikedUser.LikedBy = $"{user.Id}";
                await db.SaveChangesAsync();
                return Results.Ok();
            }
            else
            {
                getLikedUser.LikedBy = $"{getLikedUser.LikedBy};{user.Id}";
                await db.SaveChangesAsync();
                return Results.Ok();
            }
            
        }
        else
        {
            return Results.BadRequest();
        }
        
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapGet("getNextSwipe", [Authorize] async (ApplicationContext db, HttpContext context) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        string FinderROLE;
        if(user.FinderRole == "organization")
        {
            FinderROLE = "worker";
        }
        else
        {
            FinderROLE = "organization";
        }
        Portfolio? result = null;
        string[] viewedSwipes = user.viewedSwipes.Split(';');
        foreach(string viewedSwipe in viewedSwipes)
        {
            Console.WriteLine(viewedSwipe);
        }

        string[] likedBy = user.LikedBy.Split(";");
        foreach(string s in likedBy)
        {
            bool isExist = false;
            foreach(string s2 in viewedSwipes)
            {
                if(s == s2)
                {
                    isExist = true;
                }
                Console.WriteLine(s2+"-"+s);
            }
            if (!isExist)
            {
                
                result = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == s);
                Console.WriteLine("likes");
                break;
            }
        }
        if (result == null)
        {
            List<User> recommendedSwipes = await db.Users.Where(p => p.ForFinderOption.ToLower() == user.FindOption.ToLower()&&p.FinderRole==FinderROLE).ToListAsync();
            foreach (User i in recommendedSwipes)
            {
                bool isExist = false;
                foreach (string s in viewedSwipes)
                {
                    if (i.Id.ToString() == s)
                    {
                        isExist = true;
                    }
                    Console.WriteLine(i.Id.ToString() + "-" + s);
                }
                if (!isExist)
                {
                    Console.WriteLine("recommended");
                    result = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == i.Id.ToString());
                    break;
                }
            }
            
        }
        if(result == null)
        {
            List<User> allSwipes = await db.Users.Where(p=>p.FinderRole==FinderROLE).ToListAsync();
            foreach(User i in allSwipes)
            {
                bool isExist = false;
                foreach(string s in viewedSwipes)
                {
                    if(i.Id.ToString() == s)
                    {
                        isExist = true;
                    }
                }
                if(!isExist) {
                    Console.WriteLine("all");
                    result = await db.Portfolios.FirstOrDefaultAsync(p=>p.IdOwner== i.Id.ToString()); 
                    break;
                }
            }
        }
        if(result != null)
        {
            if (user.viewedSwipes != null && user.viewedSwipes != "")
            {
                user.viewedSwipes = $"{user.viewedSwipes};{result.IdOwner}";
            }
            else
            {
                user.viewedSwipes = $"{result.IdOwner}";
            }
            string json = JsonConvert.SerializeObject(result, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json";
            await response.WriteAsync(json);
            await db.SaveChangesAsync();
        }
        else
        {
            var responseContent = new
            {
                message = "All swipes are viewed"
            };
            string json = JsonConvert.SerializeObject(responseContent, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json";
            await response.WriteAsync(json);
            await db.SaveChangesAsync();
        }
        
        
        
    }
    else
    {

    }
});

app.MapGet("getMyRole", [Authorize] async (ApplicationContext db, HttpContext context) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        var response = new
        {
            role = user.FinderRole
        };
        return Results.Json(response);
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapGet("getMyGuests", [Authorize] async (ApplicationContext db, HttpContext context) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        List<Guest> guests = db.guests.Where(g => g.ProfileName == name.Value).ToList();
        string json = JsonConvert.SerializeObject(guests, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
        HttpResponse response = context.Response;
        response.Headers.ContentLanguage = "ru-Ru";
        response.ContentType = "application/json";
        await response.WriteAsync(json);
    }
});

app.MapGet("getFinderRoleByPortfolioId/{id}", async (int id, ApplicationContext db) =>
{
    Portfolio? portfolio = await db.Portfolios.FirstOrDefaultAsync(p=>p.Id == id);
    if(portfolio is not null)
    {
        User? user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == portfolio.IdOwner);
        var response = new
        {
            finderRole=user.FinderRole
        };
        return Results.Json(response);
    }
    else
    {
        return Results.BadRequest();
    }
});

app.MapGet("registerGuest/{profileId}", [Authorize] async (ApplicationContext db, HttpContext context, string profileId) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        Portfolio? guestPortfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
        Portfolio? portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.Id.ToString() == profileId);
        User? userFind = await db.Users.FirstOrDefaultAsync(u=>u.Id.ToString() == portfolio.IdOwner);
        Guest? isExist = await db.guests.FirstOrDefaultAsync(g => g.GuestName == guestPortfolio.Id.ToString() && g.ProfileName == userFind.Email);
        if(isExist == null/* && guestPortfolio.Id != userFind.Id*/)
        {
            Guest guest = new Guest() { GuestName = guestPortfolio.Id.ToString(), ProfileName = userFind.Email };
            await db.guests.AddAsync(guest);
            await db.SaveChangesAsync();
            return Results.Ok();
        }
        else
        {
            return Results.BadRequest();
        }
        
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapGet("getPortfolioForUser/{portfolioId}", async (int portfolioId, HttpContext context, ApplicationContext db) =>
{
    Portfolio? portfolio = await db.Portfolios.Include(p => p.Vacancies).Include(p=>p.Works).Include(p => p.Educations).Include(p => p.Contacts).FirstOrDefaultAsync(p=>p.Id== portfolioId);
    if(portfolio != null)
    {
        
        string json = JsonConvert.SerializeObject(portfolio, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
        HttpResponse response = context.Response;
        response.Headers.ContentLanguage = "ru-Ru";
        response.ContentType = "application/json";
        await response.WriteAsync(json);
    }
});

app.MapPost("/uploadPortfolioImgs", [Authorize] async (HttpContext context, ApplicationContext db) =>
{
    var name = context.User.FindFirst(ClaimTypes.Name);
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        IFormFileCollection files = context.Request.Form.Files;
        // ïóòü ê ïàïêå, ãäå áóäóò õðàíèòüñÿ ôàéëû
        var uploadPath = $"{Directory.GetCurrentDirectory()}/wwwroot/img/worksImgs";
        // ñîçäàåì ïàïêó äëÿ õðàíåíèÿ ôàéëîâ
        Directory.CreateDirectory(uploadPath);

        foreach (var file in files) { 

            
            // ïóòü ê ïàïêå uploads
            string fullPathForAvatar = $"{uploadPath}/{user.Id}_avatar{file.FileName.Split()[file.FileName.Split().Length - 1]}";
            string fullPath = $"{uploadPath}/{user.Id}_work{file.Name.Substring(4)}.{file.FileName.Split()[file.FileName.Split().Length-1]}";
            Portfolio? Portfolio = await db.Portfolios.Include(p=>p.Works).FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
            if (file.Name == "avatar")
            {
                Portfolio.AvatarImg = $"{user.Id}_avatar{file.FileName.Split()[file.FileName.Split().Length - 1]}";
                using (var fileStream = new FileStream(fullPathForAvatar, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
            }
            else
            {
                foreach (Work work in Portfolio.Works)
                {
                    if (work.IdInClient == file.Name.Substring(4))
                    {
                        work.WorkImg = $"{user.Id}_work{file.Name.Substring(4)}.{file.FileName.Split()[file.FileName.Split().Length - 1]}";
                        using (var fileStream = new FileStream(fullPath, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }
                    }
                }
            }
        
        }
        await db.SaveChangesAsync();
        return Results.Ok();
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapPost("/portfolioSaveChanges", [Authorize] async (requestPortfolio portfolio, HttpContext context, ApplicationContext db) =>
{
    var name = context.User.FindFirst(ClaimTypes.Name);
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value|| u.Login == name.Value);
    if (user is not null)
    {
        Portfolio? portfolioExist = await db.Portfolios.Include(p=>p.Vacancies).Include(p => p.Works).Include(p => p.Educations).Include(p => p.Contacts).FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
        if (portfolioExist is not null)
        {
            user.ForFinderOption = portfolio.profession;
            user.UserName = portfolio.name;
            portfolioExist.Profession = portfolio.profession;
            portfolioExist.ContactBtnLink = portfolio.contactBtnLink;
            portfolioExist.AboutUser = portfolio.aboutUser;
            portfolioExist.Name = portfolio.name;
            portfolioExist.KeySkills = portfolio.keySkills;
            portfolioExist.Skills = portfolio.skills;
            portfolioExist.Works.Clear();
            portfolioExist.Educations.Clear();
            portfolioExist.Contacts.Clear();
            portfolioExist.Vacancies.Clear();
            foreach (requestContact i in portfolio.contacts)
            {
                db.Contacts.Add(new Contact { Link = i.link, SocialName = i.name, Portfolio = portfolioExist });
            }
            foreach (requestWork i in portfolio.works)
            {
                db.Works.Add(new Work { IdInClient = i.idInClient, Name = i.name, WorkImg = i.img, WorkLink = i.link, Portfolio = portfolioExist });
            }
            foreach (requestEducation i in portfolio.educations)
            {
                db.Educations.Add(new Education { EstablishmentName = i.name, Profession = i.profession, Portfolio = portfolioExist });
            }
            foreach(requestVacancy i in portfolio.vacancies)
            {
                db.Vacancies.Add(new Vacancy { Education = i.education,Employment=i.employment,Salary=i.salary,Experience=i.experience, Name=i.name, Portfolio = portfolioExist });
            }
            await db.SaveChangesAsync();
            return Results.Ok();
        }
        else
        {
            Portfolio newPortfolio = new Portfolio()
            {
                IdOwner = user.Id.ToString(),
                ContactBtnLink = portfolio.contactBtnLink,
                AboutUser = portfolio.aboutUser,
                Profession = portfolio.profession,
                Name = portfolio.name,
                KeySkills = portfolio.keySkills,
                Skills = portfolio.skills,

            };
            await db.Portfolios.AddAsync(newPortfolio);
            foreach (requestContact i in portfolio.contacts)
            {
                db.Contacts.Add(new Contact { Link = i.link, SocialName = i.name, Portfolio = newPortfolio });
            }
            foreach (requestWork i in portfolio.works)
            {
                db.Works.Add(new Work { IdInClient = i.idInClient, Name = i.name, WorkImg = i.img, WorkLink = i.link, Portfolio = newPortfolio });
            }
            foreach (requestEducation i in portfolio.educations)
            {
                db.Educations.Add(new Education { EstablishmentName = i.name, Profession = i.profession, Portfolio = newPortfolio });
            }
            await db.SaveChangesAsync();
            return Results.Ok();
        }
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapPost("/getPortfolio", [Authorize] async (HttpContext context, ApplicationContext db) =>
{
    var name = context.User.FindFirst(ClaimTypes.Name);
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value );
    if (user is not null)
    {
        Portfolio? portfolio = await db.Portfolios.Include(p => p.Vacancies).Include(p=>p.Works).Include(p => p.Educations).Include(p => p.Contacts).FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
        if(portfolio is not null)
        {
            
            string json = JsonConvert.SerializeObject(portfolio, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json";
            await response.WriteAsync(json);
            
        }
        else
        {
            var Response = new
            {
                Status = "notExist"
            };
            string json = JsonConvert.SerializeObject(Response, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json; charset=utf-8";
            await response.WriteAsync(json);
            
        }
    }
    else
    {
        
    }
});

app.Map("test/{password}", async (string password,ApplicationContext db, HttpContext context) =>
{
    if(password == "")
    {
        string json = JsonConvert.SerializeObject(db.Users.ToList(), Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
        HttpResponse response = context.Response;
        response.Headers.ContentLanguage = "ru-Ru";
        response.ContentType = "application/json; charset=utf-8";
        await response.WriteAsync(json);
    }
    

});

app.MapHub<ChatHub>("/chat");
app.MapGet("getUserEmail/{id}", async (string id, ApplicationContext db) =>
{
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
    if(user != null)
    {
        var response = new
        {
            email = user.Email,
            role = user.FinderRole
        };
        return Results.Json(response);
    }
    else
    {
        return Results.BadRequest();
    }
});
app.MapGet("getUserAvatar/{name}", async (string name, ApplicationContext db) =>
{
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name);
    if (user is not null)
    {
        Portfolio? portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
        if (portfolio != null)
        {
            var response = new
            {
                avatar = portfolio.AvatarImg,
                fullname = portfolio.Name,
                profession = portfolio.Profession
            };
            return Results.Json(response);
        }
        else
        {
            return Results.BadRequest();
        }
    }
    else
    {
        return Results.BadRequest();
    }
});
app.MapGet("/getMessages/{recipient}",[Authorize] async (string recipient, ApplicationContext db, HttpContext context) =>
{
    var name = context.User.FindFirst(ClaimTypes.Name);
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    {
        Chat? chat = await db.Chats.Include(c=>c.messages).FirstOrDefaultAsync(c=>c.firstParticipant == recipient&&c.secondParticipant==name.Value||
            c.firstParticipant==name.Value&&c.secondParticipant==recipient
        );
        if(chat is not null)
        {
            string json = JsonConvert.SerializeObject(chat.messages, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
            HttpResponse response = context.Response;
            response.Headers.ContentLanguage = "ru-Ru";
            response.ContentType = "application/json; charset=utf-8";
            await response.WriteAsync(json);
        }
        
    }
});
app.MapGet("getMyChats", [Authorize] async (HttpContext context, ApplicationContext db) =>
{
var name = context.User.FindFirst(ClaimTypes.Name);
User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name.Value || u.Login == name.Value);
    if (user is not null)
    { 
        List<Chat> chats = await db.Chats.Where(c=>c.secondParticipant==name.Value||c.firstParticipant==name.Value).ToListAsync();
        string json = JsonConvert.SerializeObject(chats, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
        HttpResponse response = context.Response;
        response.Headers.ContentLanguage = "ru-Ru";
        response.ContentType = "application/json; charset=utf-8";
        await response.WriteAsync(json);
    }
    else
    {
        
    }
});
app.MapGet("/getMyClaim", [Authorize] async (HttpContext context, ApplicationContext db) =>
{
    var claim = context.User.FindFirst(ClaimTypes.Name).Value;
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == claim);
    if (user is not null)
    {
        Console.WriteLine(user.Id.ToString());
        Portfolio? portfolio = await db.Portfolios.FirstOrDefaultAsync(p => p.IdOwner == user.Id.ToString());
        if (portfolio != null)

        {
            
            var response = new
            {
                name = claim,
                avatar = portfolio.AvatarImg,
                fullname = portfolio.Name,
                profession = portfolio.Profession
            };
            return Results.Json(response);
        }
        else
        {
            return Results.BadRequest();
        }
    }
    else
    {
        return Results.Unauthorized();
    }
    
});
app.MapGet("/sendMessage/{recipient}/{sender}/{content}", [Authorize] async (string recipient, string sender, string content, ApplicationContext db, HttpContext context, IHubContext<ChatHub> hubContext) =>
{
    var name = context.User.FindFirst(ClaimTypes.Name).Value;
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == name || u.Login == name);
    if (user is not null)
    {
        Chat? chat = await db.Chats.FirstOrDefaultAsync(c => c.firstParticipant == name && c.secondParticipant == recipient ||
        c.firstParticipant == recipient && c.secondParticipant == name
        );
        if (chat == null)
        {
            Chat newChat = new Chat() { firstParticipant = name, secondParticipant = recipient, lastMessage = content };
            Message message = new Message() { Content = content, Sender = name, Recipient = recipient, Chat = newChat };
            await db.Chats.AddAsync(newChat);
            await db.Messages.AddAsync(message);
            await db.SaveChangesAsync();
            await hubContext.Clients.All.SendAsync("Receive", name, recipient, content);
            return Results.Ok();
        }
        else
        {
            Message message = new Message() { Content = content, Sender = name, Recipient = recipient, Chat = chat };
            await db.Messages.AddAsync(message);
            await db.SaveChangesAsync();
            await hubContext.Clients.All.SendAsync("Receive", name, recipient, content);
            return Results.Ok();
        }
    }
    else
    {
        return Results.Unauthorized();
    }
});

app.MapGet("api/getUserInfo", [Authorize] async (HttpContext context, ApplicationContext db) => {
    var name = context.User.FindFirst(ClaimTypes.Name);
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Login == name.Value || u.Email == name.Value);
    //return Results.Json(user);
    string json = JsonConvert.SerializeObject(user, Formatting.Indented,
                    new JsonSerializerSettings()
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    });
    HttpResponse response = context.Response;
    response.Headers.ContentLanguage = "ru-Ru";
    response.ContentType = "application/json; charset=utf-8";
    await response.WriteAsync(json);
});
app.Map("/logout", (HttpContext context) =>
{
    context.Session.Remove("accessToken");
    context.Session.Clear();
    return Results.Redirect("/login.html");
});
app.MapPost("api/loginUser", async (LoginData loginData, ApplicationContext db, HttpContext context) =>
{
    User? user = await db.Users.FirstOrDefaultAsync(u => u.Email == loginData.loginOrEmail && u.Password == loginData.password || u.Login == loginData.loginOrEmail && u.Password == loginData.password);
    if (user == null)
    {
        return Results.Unauthorized();
    }
    else if (user.Role == "Admin")
    {
        return Results.Unauthorized();
    }
    else
    {
        List<Claim> claims = new List<Claim> { new Claim(ClaimTypes.Name, user.Email) };
        JwtSecurityToken jwt = new JwtSecurityToken(
                issuer: AuthOptions.ISSUER,
                audience: AuthOptions.AUDIENCE,
                claims: claims,
                expires: DateTime.UtcNow.Add(TimeSpan.FromDays(7)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256)
            );
        string encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);
        context.Session.SetString("accessToken", encodedJwt);
        var response = new
        {
            access_token = encodedJwt,
            username = user.Email
        };
        return Results.Json(response);

    }
});
app.Map("createTestUser", async (ApplicationContext db) =>
{
    User newUser = new User { Login = "MagRiPeid1", Email = "magripeid1@gmail.com", Password = "Nike7363", Role = "User", FinderRole= "worker", FindOption="IT", ForFinderOption="Ïðîãðàììèñò" };
    User newUser2 = new User { Login = "MagRiPeid2", Email = "magripeid2@gmail.com", Password = "Nike7363", Role = "User", FinderRole = "worker", FindOption = "IT", ForFinderOption = "Ïðîãðàììèñò" };
    User newUser3 = new User { Login = "MagRiPeid3", Email = "magripeid3@gmail.com", Password = "Nike7363", Role = "User", FinderRole = "organization", FindOption = "Ïðîãðàììèñò", ForFinderOption = "IT" };
    User newUser4 = new User { Login = "MagRiPeid4", Email = "magripeid4@gmail.com", Password = "Nike7363", Role = "User", FinderRole = "organization", FindOption = "Ïðîãðàììèñò", ForFinderOption = "IT" };
    Portfolio newPortfolio1 = new Portfolio { IdOwner = "1" };
    Portfolio newPortfolio2 = new Portfolio { IdOwner = "2" };
    Portfolio newPortfolio3 = new Portfolio { IdOwner = "3" };
    Portfolio newPortfolio4 = new Portfolio { IdOwner = "4" };
    await db.Users.AddRangeAsync(newUser, newUser2, newUser3, newUser4);
    await db.Portfolios.AddRangeAsync(newPortfolio1, newPortfolio2, newPortfolio3, newPortfolio4);
    await db.SaveChangesAsync();
    return Results.Ok();
});
app.MapPost("api/endEmailConfirmation", async (RegistrationData data, ApplicationContext db) =>
{
    Console.WriteLine(data.Code + " " + data.Id);
    EmailCode? emailCode = await db.EmailCodes.FirstOrDefaultAsync(c => c.Id == int.Parse(data.Id) && c.Code == data.Code && c.Email == data.Email);

    if (emailCode is not null)
    {
        User? isExist = await db.Users.FirstOrDefaultAsync(u => u.Email == data.Email || u.Login == data.Login);
        db.EmailCodes.Remove(emailCode);
        db.SaveChanges();
        if (isExist == null)
        {
            int LoginLength = data.Login.Length;
            int PassLength = data.Password.Length;
            if (LoginLength < 5 || PassLength < 8 || !data.Email.Contains("@") || LoginLength > 20 || PassLength > 25)
            {
                return Results.BadRequest();
            }
            else
            {
                User newUser = new User { Login = data.Login, Email = data.Email, Password = data.Password, Role = "User",
                DateOfBirth = data.DateOfBirth, Experience = data.Experience, FinderRole = data.FinderRole, FindOption = data.FindOption,
                ForFinderOption = data.ForFinderOption, UserName = data.UserName
                };
                
                await db.Users.AddAsync(newUser);
                await db.SaveChangesAsync();
                User? getId = await db.Users.FirstOrDefaultAsync(u=>u.Email== data.Email&&u.Login==data.Login);
                Portfolio portfolio = new Portfolio() { Name = data.UserName,Profession=data.ForFinderOption, IdOwner = getId.Id.ToString()};
                await db.Portfolios.AddAsync(portfolio);
                await db.SaveChangesAsync();
                return Results.Ok();
            }
        }
        else
        {
            return Results.BadRequest();
        }

    }
    else
    {
        return Results.BadRequest();
    }

});
app.MapGet("api/startEmailConfirmation/{email}", async (string email, ApplicationContext db) =>
{
        Email? EMAIl = await db.emails.FirstOrDefaultAsync(e => e.Id == 1);
        Random rnd = new Random();
        string value = rnd.Next(1, 99995).ToString();
        if (value.Length < 5)
        {
            value = string.Concat(Enumerable.Repeat("0", 5 - value.Length)) + value;
        }
        Console.WriteLine(value);
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(EMAIl.Mail));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = "Âàø êîä äëÿ SvapeJob: " + value;
        message.Body = new TextPart(TextFormat.Plain) { Text = "Âàø êîä äëÿ SvapeJob: " + value };

        using var smtp = new SmtpClient();
        smtp.Connect("smtp.office365.com", 587, SecureSocketOptions.StartTls);
        smtp.Authenticate(EMAIl.Mail, EMAIl.Password);
        smtp.Send(message);
        smtp.Disconnect(true);

        EmailCode emailCode = new EmailCode { Code = value, Email = email };
        await db.EmailCodes.AddAsync(emailCode);
        await db.SaveChangesAsync();
        EmailCode? findId = await db.EmailCodes.FirstOrDefaultAsync(c => c.Code == value && c.Email == email);

        var response = new
        {
            Id = findId.Id
        };
        return Results.Json(response);

});

app.Run();
public class AuthOptions
{
    public const string ISSUER = "AuthServer";
    public const string AUDIENCE = "FolioTheService";
    const string KEY = "SuperSecretFolioCoreKey228AYEFraer";
    public static SymmetricSecurityKey GetSymmetricSecurityKey() =>
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}
