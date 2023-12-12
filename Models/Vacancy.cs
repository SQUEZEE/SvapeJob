namespace Folio.Models
{
    public class Vacancy
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Education { get; set; } = "";
        public string Experience { get; set; } = "";
        public string Employment { get; set; } = "";
        public string Salary { get; set; } = "";
        public int PortfolioId { get; set; }
        public Portfolio? Portfolio { get; set; }
    }
}
