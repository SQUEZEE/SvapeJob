namespace Folio.Models
{
    public class Contact
    {
        public int Id { get; set; }
        public string SocialName { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public int PortfolioId { get; set; }
        public Portfolio? Portfolio { get; set; }
    }
}
