namespace Folio.Models
{
    public class Education
    {
        public int Id { get; set; }
        public string EstablishmentName { get; set; } = string.Empty;
        public string Profession { get; set; } = string.Empty;
        public int PortfolioId { get; set; }
        public Portfolio? Portfolio { get; set; }
    }
}
