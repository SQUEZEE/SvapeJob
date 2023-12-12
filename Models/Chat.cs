namespace Folio.Models
{
    public class Chat
    {
        public int Id { get; set; }
        public string firstParticipant { get; set; } = null!;
        public string secondParticipant { get; set; } = null!;
        public string lastMessage { get; set; } = null!;
        public List<Message> messages { get; set; } = new();
    }
}
