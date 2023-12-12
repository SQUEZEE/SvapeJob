namespace Folio.Models
{
    public class SendMessageModel
    {
        public string Sender { get; set; } = null!;
        public string Recipient { get; set; } = null!;
        public string Content { get; set; } = null!;

    }
}
