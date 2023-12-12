namespace Folio.Models
{
    public class requestPortfolio
    {
        public string name { get; set; } = string.Empty;
        public string aboutUser { get; set; } = string.Empty;
        public string avatarImg { get; set; } = string.Empty;
        public string profession { get; set; } = string.Empty;
        public string keySkills { get; set; } = string.Empty;
        public string contactBtnLink { get; set; } = string.Empty;
        public string skills { get; set; } = string.Empty;
        public List<requestContact> contacts { get; set; } = new();
        public List<requestWork> works { get; set; } = new();
        public List<requestEducation> educations { get; set; } = new();
        public List<requestVacancy> vacancies { get; set; } = new();
    }
}
