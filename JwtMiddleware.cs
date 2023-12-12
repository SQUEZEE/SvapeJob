namespace Folio
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate next;
        public JwtMiddleware(RequestDelegate requestDelegate)
        {
            next = requestDelegate;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            string? token = context.Session.GetString("accessToken");
            if (token is not null)
            {
                context.Request.Headers.Add("Authorization", "Bearer " + token);
            }
            await next.Invoke(context);
        }
    }
}
