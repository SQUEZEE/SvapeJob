namespace Folio.Models
{
    public class Work
    {
        public int Id { get; set; }
        public string IdInClient { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string WorkImg { get; set; } = string.Empty; 
        public string WorkLink { get; set; } = string.Empty;
        public int PortfolioId { get; set; }
        public Portfolio? Portfolio { get; set; }
    }
}
