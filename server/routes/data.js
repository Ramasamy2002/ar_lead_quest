import express from 'express';
import Data from '../models/Data.js';
import auth from '../middleware/auth.js';
import { sendEmails } from '../utils/emailService.js';
import { generateEmailContent } from '../utils/geminiService.js';
import cors from 'cors';
import { encrypt, decrypt } from '../encryption/encrypt.js';

const router = express.Router();

router.use(cors());

router.get('/', auth, async (req, res) => {
  try {
    const data = await Data.find({ userId: req.user.userId });
    console.log(data);
    const decryptedData = data.map(item => {
      return {
        name: item.name,
        email: decrypt(item.email),
        url: item.url,
      };
    });
    console.log(decryptedData);
    res.json(decryptedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, url } = req.body;
    const encryptedData = encrypt(email);
    console.log(encryptedData);
    const data = new Data({
      name,
      email: encryptedData,
      url,
      userId: req.user.userId,
    });
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error saving data' });
  }
});

router.post('/send-email', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;

    const data = await Data.find({ userId: req.user.userId });
    const rawEmails = data.map(item => item.email);

    // Validate emails
    const emails = validateEmails(rawEmails);
    if (emails.length === 0) {
      return res.status(400).json({ message: 'No valid email recipients found' });
    }

    // Send emails in batches
    const batchSize = 50; // Adjust this number as needed to fit your SMTP limits
    const sendBatchedEmails = async (recipients, subject, text) => {
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const results = await sendEmails(batch, subject, text, `<p>${text}</p>`);
        const failed = results.filter(result => result.status === 'failed');
        if (failed.length > 0) {
          console.error('Failed emails:', failed);
        }
      }
    };

    // Send emails
    await sendBatchedEmails(emails, subject, message);

    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error in /send-email route:', error);
    res.status(500).json({ message: 'Error sending emails' });
  }
});

// Helper function to validate email addresses
const validateEmails = (emails) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.filter(email => emailRegex.test(email));
};

router.post('/generate-content', auth, async (req, res) => {
  try {
    const { topic, tone, length } = req.body;
    const prompt = `Write an email about "${topic}". The tone should be ${tone}. 
                   The length should be ${length}. Make it engaging and professional.`;
    
    const generatedContent = await generateEmailContent(prompt);
    res.json({ content: generatedContent });
  } catch (error) {
    res.status(500).json({ message: 'Error generating email content' });
  }
});

export default router;