using System.Net.Mail;
using System.Net;

namespace BackgammonFinalProject.Server.Services
{
    public class EmailService
    {
        //private readonly IConfiguration _configuration;
        //private readonly SmtpClient _smtpClient;

        //public EmailService(IConfiguration configuration)
        //{
        //    _configuration = configuration;
        //    _smtpClient = new SmtpClient
        //    {
        //        Host = _configuration["EmailSettings:SmtpHost"],
        //        Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
        //        EnableSsl = true,
        //        Credentials = new NetworkCredential(
        //            _configuration["EmailSettings:Username"],
        //            _configuration["EmailSettings:Password"]
        //        )
        //    };
        //}

        //public async Task SendEmailAsync(string to, string subject, string content)
        //{
        //    var mailMessage = new MailMessage
        //    {
        //        From = new MailAddress(_configuration["EmailSettings:FromEmail"]),
        //        Subject = subject,
        //        Body = content,
        //        IsBodyHtml = true
        //    };
        //    mailMessage.To.Add(to);

        //    await _smtpClient.SendMailAsync(mailMessage);
        //}
    }
}
