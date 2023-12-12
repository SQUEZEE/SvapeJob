namespace Folio.Models
{
    public class Portfolio
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string IdOwner { get; set; } = string.Empty;
        public string AboutUser { get; set; } = string.Empty;
        public string Profession { get; set; } = string.Empty;
        public string AvatarImg { get; set; } = string.Empty;
        public string KeySkills { get; set; } = string.Empty;
        public string ContactBtnLink { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public List<Contact> Contacts { get; set; } = new();
        public List<Work> Works { get; set; } = new();
        public List<Vacancy> Vacancies { get; set; } = new();
        public List<Education> Educations { get; set; } = new();
    }
}
