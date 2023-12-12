namespace Folio.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Login { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Role { get; set; } = "";
        public string FinderRole { get; set; } = "";
        public string UserName { get; set; } = "";
        public string Experience { get; set; } = "";
        public string DateOfBirth { get; set; } = "";
        public string FindOption { get; set; } = "";
        public string ForFinderOption { get; set; } = "";
        public string viewedSwipes { get; set; } = "";
        public string LikedBy { get; set; } = "";

    }
}
