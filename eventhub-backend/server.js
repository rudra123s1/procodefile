// server.js

// 1. Import the tools we installed
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

// 2. Setup our server
const app = express();
app.use(cors()); // Allow our website to talk to this server
app.use(express.json()); // Allow the server to understand JSON data

// 3. Configure the email sender (Nodemailer)
// This is where the server logs into your email to send messages.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',         // 👈 Your full Gmail address
        pass: 'your-16-digit-app-password'    // 👈 Your Google App Password
    }
});

// 4. Create an API Endpoint for the Contact Form
// An "endpoint" is like a specific URL that does one job.
// This one waits for a "POST" request at the URL /api/contact
app.post('/api/contact', (req, res) => {
    console.log('Received a message:', req.body);

    // Get the form data from the incoming request
    const { name, email, phone, inquiry_type, message } = req.body;

    // Create the email content
    const mailOptions = {
        from: `"${name}" <${email}>`, // Show sender's name and email
        to: 'your-email@gmail.com',  // 👈 The email where you want to receive messages
        subject: `New Inquiry: ${inquiry_type}`,
        html: `
            <h2>New Message from EventHub Contact Form</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Reason:</strong> ${inquiry_type}</p>
            <hr>
            <h3>Message:</h3>
            <p>${message}</p>
        `
    };

    // Try to send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
        } else {
            console.log('Email sent successfully!', info.response);
            res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
        }
    });
});

// 5. Start the server and listen for requests
const PORT = 3001; // We'll run it on port 3001
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});