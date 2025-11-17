import { supabaseAdmin } from '../config/supabase.js';

let transporter = null;

// Initialize email transporter lazily
const getTransporter = async () => {
  if (transporter) return transporter;
  
  try {
    const nodemailer = (await import('nodemailer')).default;
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    return transporter;
  } catch (error) {
    console.warn('⚠️ Nodemailer not installed - email sending disabled. Run: npm install nodemailer');
    return null;
  }
};

// Send email
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, template, variables } = req.body;

    // Get template
    const { data: emailTemplate } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('name', template)
      .single();

    if (!emailTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Replace variables in template
    let html = emailTemplate.html;
    Object.entries(variables || {}).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Get transporter and send email
    const mailer = await getTransporter();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      });
    } else {
      console.warn('Email service not available - email not sent');
    }

    // Log email
    await supabaseAdmin.from('email_logs').insert([{
      to,
      subject,
      template,
      status: 'sent',
      created_at: new Date()
    }]);

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get templates
export const getTemplates = async (req, res) => {
  try {
    const { data: templates, error } = await supabaseAdmin
      .from('email_templates')
      .select('*');

    if (error) throw error;

    res.status(200).json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create template
export const createTemplate = async (req, res) => {
  try {
    const { name, subject, html, variables } = req.body;

    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .insert([{ name, subject, html, variables, created_at: new Date() }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get settings
export const getSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('email_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({
      success: true,
      settings: settings || {
        from_email: process.env.EMAIL_FROM,
        from_name: 'Educational Platform',
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('email_settings')
      .upsert({ ...settings, updated_at: new Date() })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
