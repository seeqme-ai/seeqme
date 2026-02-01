package resend

func (r *Resend) SendContactFormEmail(fromEmail, subject, message string) error {
	toEmail := "support@seeqme.com"

	data := map[string]interface{}{
		"Email":   fromEmail,
		"Subject": subject,
		"Message": message,
	}

	return r.SendEmail(toEmail, "New Contact Form Submission: "+subject, "contact_form.html", data)
}
