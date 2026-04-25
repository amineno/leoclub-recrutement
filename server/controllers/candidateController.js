const Candidate = require('../models/Candidate');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { evaluatePhase2 } = require('../services/evaluationService');
const emailService = require('../services/emailService');
const { generatePhase2Token } = require('../utils/generateToken');

const getEmailTemplate = (content, title) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .header { background-color: #3b82f6; padding: 40px 20px; text-align: center; color: white; }
        .body { padding: 40px 30px; line-height: 1.6; color: #1e293b; background-color: white; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; text-align: center; }
        .logo-text { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase; }
        .accent { color: #3b82f6; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">Lions Club</h1>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #0f172a;">${title}</h2>
          ${content}
          <p style="margin-top: 40px;">Best regards,<br/><span class="accent">The Lions Club Team</span></p>
        </div>
        <div class="footer">
          © 2026 Lions Club International. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`;

exports.apply = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check for existing candidate
    const existingCandidate = await Candidate.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingCandidate) {
      return res.status(400).json({ 
        message: 'Vous avez déjà postulé avec cet email ou ce numéro de téléphone.' 
      });
    }

    const candidate = new Candidate(req.body);
    await candidate.save();

    // Send email notification using Brevo
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Application Received - Lions Club',
        html: getEmailTemplate(`
          <p>Hello <span class="accent">${req.body.firstName}</span>,</p>
          <p>We have successfully received your application for the <b>Lions Club Recruitment 2026</b>.</p>
          <p>Our team will carefully review your profile. You will hear back from us soon regarding the next steps.</p>
        `, 'Application Received!')
      });
    } catch (err) {
      console.error('Initial application email failed, continuing...', err.message);
    }

    res.status(201).json({ message: 'Application submitted successfully!', candidate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { search, studyYear, department, axis, status, score, sort, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (studyYear) query.studyYear = studyYear;
    if (department) query.departments = department;
    if (axis) query.axis = axis;
    if (status) query.status = status;
    if (score) query.score = parseInt(score);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let candidatesQuery = Candidate.find(query);

    if (sort === 'newest') candidatesQuery = candidatesQuery.sort({ createdAt: -1 });
    else if (sort === 'oldest') candidatesQuery = candidatesQuery.sort({ createdAt: 1 });

    const total = await Candidate.countDocuments(query);
    const results = await candidatesQuery.skip(skip).limit(parseInt(limit));
    
    res.json({
      candidates: results,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Candidate Status & TRIGGER EMAILS
 */
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    // Check if status is actually changing
    if (candidate.status === status) {
      return res.json(candidate);
    }

    // 1. Accepted Phase 1 (Move to Phase 2 -> status: 'Pending Phase 2') OR general 'accepted'
    if (status === 'accepted' || status === 'Pending Phase 2' || status === 'Accepted Phase 1') {
      const token = generatePhase2Token(candidate);
      candidate.magicToken = token;
      candidate.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      candidate.phase = 2;
      candidate.status = 'Pending Phase 2'; // Formal schema state
      
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const magicLink = `${appUrl}/continue?token=${token}`;
      
      try {
        await emailService.sendEmail({
          to: candidate.email,
          subject: "You're Accepted 🎉 (Phase 2 Access)",
          html: getEmailTemplate(`
            <p>Congratulations <span class="accent">${candidate.firstName}</span>!</p>
            <p>We are thrilled to inform you that your initial profile has successfully passed our review. You are now invited to <b>Phase 2</b> of our recruitment process.</p>
            <p>This phase is an advanced evaluation to understand your psychological reasoning, motivations, and problem-solving skills.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-family: sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                👉 ACCÉDER À LA PHASE 2 👈
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
              Si le bouton ne fonctionne pas, copiez ce lien exact et collez-le dans votre navigateur :<br/>
              <a href="${magicLink}" style="color: #3b82f6; word-break: break-all;">${magicLink}</a>
            </p>
            <p style="font-size: 11px; margin-top: 30px; color: #94a3b8;">This secure link will expire in 24 hours. Do not share it.</p>
          `, 'Welcome to Phase 2')
        });
      } catch(e) { console.error('Failed to send phase 2 email:', e); }
    }
    
    // 2. Rejected
    else if (status === 'rejected' || status === 'Rejected Phase 1' || status === 'Rejected Phase 2') {
      candidate.status = status.startsWith('Rejected') ? status : 'Rejected Phase 1';
      
      try {
        await emailService.sendEmail({
          to: candidate.email,
          subject: "Update regarding your application",
          html: getEmailTemplate(`
            <p>Dear <span class="accent">${candidate.firstName}</span>,</p>
            <p>Thank you for taking the time to apply to the Lions Club. We appreciate your interest and the effort you put into your application.</p>
            <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. The selection process was highly competitive this year.</p>
            <p>We wish you the very best in your future endeavors.</p>
          `, 'Application Update')
        });
      } catch(e) { console.error('Failed to send rejection email:', e); }
    }
    
    // 3. Accepted Final / Phase 2
    else if (status === 'Accepted Phase 2') {
      candidate.status = 'Accepted Phase 2';
      try {
        await emailService.sendEmail({
          to: candidate.email,
          subject: "Final Acceptance 🎉 Welcome to the Club!",
          html: getEmailTemplate(`
            <p>Dear <span class="accent">${candidate.firstName}</span>,</p>
            <p>We have truly enjoyed getting to know you. Your Phase 2 evaluation was exactly what we were looking for!</p>
            <p>We are delighted to officially <b style="color: #10b981;">accept</b> you into the Lions Club.</p>
            <p>Our team will contact you shortly with the onboarding details and upcoming meeting schedules.</p>
          `, 'Congratulations! 🚀')
        });
      } catch(e) { console.error('Failed to send final accept email:', e); }
    }
    
    // Default Status update without specific email
    else {
      candidate.status = status;
    }

    await candidate.save();
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.phase2Verify = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidateAuth.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });

    // Ensure candidate is in right status
    if (candidate.status !== 'Pending Phase 2') {
      return res.status(400).json({ message: 'Lien invalide ou candidature déjà soumise.' });
    }

    res.json({ message: 'Valid token', candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.phase2Submit = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidateAuth.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    
    if (candidate.status !== 'Pending Phase 2') {
      return res.status(400).json({ message: 'Étape 2 déjà soumise.' });
    }

    const { phase2Answers } = req.body;
    const evaluation = evaluatePhase2(phase2Answers);

    const updatedCandidate = await Candidate.findByIdAndUpdate(candidate._id, {
      phase2Answers,
      totalScore: evaluation.totalScore,
      scoreBreakdown: evaluation.breakdown,
      classification: evaluation.classification,
      evaluationSummary: evaluation.summary,
      status: 'Pending Phase 2', // Admin will have to make a final review, or we can use another intermediate status
      magicToken: null, // Invalidate token after submission
      tokenExpiresAt: null
    }, { new: true });

    res.json({ message: 'Phase 2 submitted successfully!', candidate: updatedCandidate });
    
    // Send Phase 2 Submission Confirmation
    try {
      await emailService.sendEmail({
        to: updatedCandidate.email,
        subject: "Phase 2 Evaluation Received",
        html: getEmailTemplate(`
          <p>Dear <span class="accent">${updatedCandidate.firstName}</span>,</p>
          <p>We confirm the submission of your Phase 2 evaluation. Thank you for your time and effort!</p>
          <p>Our team will review your detailed answers and we will inform you of the final decision shortly.</p>
        `, 'Phase 2 Received')
      });
    } catch(e) { console.error('Failed to send phase 2 confirmation email:', e); }

    // NOTIFY ADMIN WITH A FULL COPY OF THE ANSWERS
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_EMAIL || 'admin@leoclub.com';
      
      let answersHtml = '';
      for (const [key, val] of Object.entries(phase2Answers)) {
        if (val) {
          answersHtml += `<h3 style="color:#3b82f6; margin-top:20px; text-transform:uppercase;">${key}</h3>
                          <div style="background-color:#f8fafc; padding:15px; border-radius:8px; white-space:pre-wrap; border-left: 4px solid #3b82f6; color:#334155; font-size:14px;">${val}</div>`;
        }
      }

      await emailService.sendEmail({
        to: adminEmail,
        subject: `🚨 [PHASE 2 SOUMISE] - ${updatedCandidate.firstName} ${updatedCandidate.lastName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h2 style="color: #0f172a;">Nouvelle Évaluation Phase 2 Terminée !</h2>
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin:5px 0;"><strong>👤 Candidat :</strong> ${updatedCandidate.firstName} ${updatedCandidate.lastName}</p>
              <p style="margin:5px 0;"><strong>📧 Email :</strong> ${updatedCandidate.email}</p>
              <p style="margin:5px 0;"><strong>⭐ Score Automatique :</strong> ${evaluation.totalScore} / 100</p>
              <p style="margin:5px 0;"><strong>📊 Classification :</strong> ${evaluation.classification}</p>
            </div>
            
            <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Réponses Complètes du Candidat</h2>
            ${answersHtml}
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #0f172a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ouvrir le Dashboard Admin
              </a>
            </div>
          </div>
        `
      });
    } catch(e) { console.error('Failed to notify Admin:', e); }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Advanced Excel Export (.xlsx)
 * Guaranteed compatibility with Microsoft Excel Windows/Mac
 */
exports.exportExcel = async (req, res) => {
  console.log('--- EXPORT EXCEL START ---');
  try {
    const { search, studyYear, department, axis, status, score } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (studyYear) query.studyYear = studyYear;
    if (department) query.departments = department;
    if (axis) query.axis = axis;
    if (status) query.status = status;
    if (score) query.score = parseInt(score);

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    console.log(`Found ${candidates.length} candidates to export`);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidats 2026');

    // Define columns
    worksheet.columns = [
      { header: 'NOM', key: 'lastName', width: 20 },
      { header: 'PRÉNOM', key: 'firstName', width: 20 },
      { header: 'EMAIL', key: 'email', width: 30 },
      { header: 'TÉLÉPHONE', key: 'phone', width: 20 },
      { header: 'DATE DE NAISSANCE', key: 'birthDate', width: 20 },
      { header: "NIVEAU D'ÉTUDE", key: 'studyYear', width: 15 },
      { header: 'DÉPARTEMENTS', key: 'departments', width: 40 },
      { header: 'AXE PRÉFÉRÉ', key: 'axis', width: 20 },
      { header: 'COMPÉTENCES', key: 'skills', width: 40 },
      { header: 'STATUT', key: 'status', width: 15 },
      { header: 'SCORE', key: 'score', width: 10 },
      { header: 'NOTES ADMIN', key: 'notes', width: 30 },
      { header: "DATE D'INSCRIPTION", key: 'createdAt', width: 25 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    candidates.forEach((c, index) => {
      try {
        worksheet.addRow({
          lastName: (c.lastName || c.name || '').toString().toUpperCase(),
          firstName: (c.firstName || '').toString(),
          email: (c.email || '').toString(),
          phone: (c.phone || '').toString(),
          birthDate: (c.birthDate || '').toString(),
          studyYear: (c.studyYear || '').toString(),
          departments: Array.isArray(c.departments) ? c.departments.join(' | ') : (c.departments || '').toString(),
          axis: (c.axis || '').toString(),
          skills: Array.isArray(c.skills) ? c.skills.join(' | ') : (c.skills || '').toString(),
          status: (c.status || 'Pending').toString(),
          score: c.score || 0,
          notes: (c.notes || '').toString(),
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : 'N/A'
        });
      } catch (rowError) {
        console.error(`Error adding row ${index} for candidate ${c._id}:`, rowError.message);
      }
    });

    worksheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      if (rowNumber === 1) row.alignment = { vertical: 'middle', horizontal: 'center' };
      if (rowNumber > 1) {
        row.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      }
    });

    const fileName = `recrutement_lions_club_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    console.log('Writing workbook to response...');
    await workbook.xlsx.write(res);
    console.log('--- EXPORT EXCEL SUCCESS ---');
    return res.end();

  } catch (error) {
    console.error('--- EXPORT EXCEL ERROR ---');
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Erreur lors de la génération du fichier Excel', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

/**
 * Legacy CSV Export (Enhanced for Excel compatibility)
 */
exports.exportCSV = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    
    // We use quotes: true to ensure all fields are wrapped in double quotes
    // and escaped properly for Excel
    const fields = [
      { label: 'Nom', value: (row) => (row.lastName || '').toUpperCase() },
      { label: 'Prénom', value: 'firstName' },
      { label: 'Email', value: 'email' },
      { label: 'Téléphone', value: 'phone' },
      { label: 'Date de naissance', value: 'birthDate' },
      { label: "Niveau d'étude", value: 'studyYear' },
      { 
        label: 'Départements', 
        value: (row) => Array.isArray(row.departments) ? row.departments.join(' | ') : '' 
      },
      { label: 'Axe Préféré', value: 'axis' },
      { 
        label: 'Compétences', 
        value: (row) => Array.isArray(row.skills) ? row.skills.join(' | ') : '' 
      },
      { label: 'Statut', value: 'status' },
      { label: 'Notes Admin', value: (row) => row.notes || '' },
      { 
        label: "Date d'inscription", 
        value: (row) => new Date(row.createdAt).toLocaleString('fr-FR')
      }
    ];

    const opts = { 
      fields,
      delimiter: ';', // Standard for Excel in many regions
      withBOM: true,   // UTF-8 BOM
      quote: '"'       // Ensure proper quoting
    };
    
    const parser = new Parser(opts);
    const csv = parser.parse(candidates);
    
    // The "sep=;" trick for Windows Excel
    const finalCsv = `sep=;\r\n${csv}`;
    
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('candidats_lions_club_2026.csv');
    
    // Send with UTF-8 BOM
    res.send(Buffer.from('\uFEFF' + finalCsv, 'utf-8'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Test Route for Email Service
 */
exports.testEmail = async (req, res) => {
  try {
    const to = "developer@yopmail.com"; // Default test email
    await emailService.sendEmail({
      to,
      subject: "Test Email from Development",
      html: getEmailTemplate(`
        <p>This is a test email sent from the Recruitment Platform.</p>
        <p>If you see this, your Brevo API key and configuration are working.</p>
      `, "Email Service Working")
    });
    
    res.json({ message: `Test email sent successfully to ${to}` });
  } catch (error) {
    res.status(500).json({ message: error.message, details: 'Email service test failed.' });
  }
};
