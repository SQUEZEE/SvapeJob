namespace Folio.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string Sender { get; set; } = null!;
        public string Recipient { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int ChatId { get; set; }
        public Chat? Chat { get; set; }

    }
}
