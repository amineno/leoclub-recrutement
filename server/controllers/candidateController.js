const Candidate = require('../models/Candidate');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getEmailTemplate = (content, title) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .header { background-color: #3b82f6; padding: 40px 20px; text-align: center; color: white; }
        .body { padding: 40px 30px; line-height: 1.6; color: #1e293b; background-color: white; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .logo-text { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase; }
        .accent { color: #3b82f6; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-text">Lions Club</h1>
          <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8;">Recrutement 2026</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #0f172a;">${title}</h2>
          ${content}
          <p style="margin-top: 40px;">Cordialement,<br/><span class="accent">L'équipe Lions Club</span></p>
        </div>
        <div class="footer">
          © 2026 Lions Club International. Tous droits réservés.
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

    // Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: `"Lions Club Recruitment" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Confirmation de votre candidature - Lions Club',
        html: getEmailTemplate(`
          <p>Bonjour <span class="accent">${req.body.firstName}</span>,</p>
          <p>Nous avons bien reçu votre candidature pour le <b>Lions Club Recruitment 2026</b>.</p>
          <p>Notre équipe va examiner votre profil avec attention. Votre engagement est le premier pas vers un impact positif dans notre communauté.</p>
          <p>Vous recevrez une réponse très prochainement concernant la suite de votre processus.</p>
        `, 'Candidature Reçue !')
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
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
    
    // Send email if status changed
    if (req.body.status && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const isAccepted = req.body.status === 'Accepted';
      const mailOptions = {
        from: `"Lions Club Recruitment" <${process.env.EMAIL_USER}>`,
        to: candidate.email,
        subject: isAccepted ? 'Félicitations ! Votre candidature a été retenue' : 'Mise à jour concernant votre candidature',
        html: getEmailTemplate(`
          <p>Bonjour <span class="accent">${candidate.firstName}</span>,</p>
          <p>${isAccepted 
            ? 'Nous avons le plaisir de vous annoncer que votre candidature a été <b style="color: #10b981;">acceptée</b> ! Bienvenue au Lions Club.' 
            : 'Nous vous remercions de l\'intérêt que vous portez au Lions Club. Malheureusement, nous ne pouvons pas donner suite à votre candidature pour le moment.'}</p>
          
          ${isAccepted && candidate.interviewDate ? `
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #bae6fd;">
              <p style="margin: 0; font-weight: bold; color: #0369a1;">Détails de votre entretien :</p>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #0c4a6e;">📅 <b>${new Date(candidate.interviewDate).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</b></p>
            </div>
          ` : ''}

          <p style="margin-top: 30px;">${isAccepted 
            ? 'Nous sommes impatients de vous rencontrer et de commencer à travailler ensemble sur nos projets humanitaires.' 
            : 'Nous vous souhaitons beaucoup de succès dans vos futurs projets.'}</p>
        `, isAccepted ? 'Félicitations ! 🎉' : 'Mise à jour de votre dossier')
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
    }

    res.json(candidate);
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
