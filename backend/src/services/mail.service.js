const transporter = require('../config/mailer');

const FROM = `"CleanCity" <${process.env.EMAIL_USER}>`;

const sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Welcome to CleanCity! 🌱',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px">
        <h1 style="color:#22d3ee;margin-bottom:8px">Welcome to CleanCity, ${user.name}!</h1>
        <p>Your account has been created successfully. You can now report waste management issues in your city.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#22d3ee;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700">
          Get Started →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#64748b">CleanCity — Making our cities cleaner, one report at a time.</p>
      </div>
    `,
  });
};

const sendComplaintReceivedEmail = async (email, trackingId, category) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Complaint Received — Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px">
        <h1 style="color:#22d3ee">Complaint Received ✅</h1>
        <p>Your complaint about <strong>${category}</strong> has been received.</p>
        <div style="background:#1e293b;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#94a3b8">Tracking ID</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#22d3ee;letter-spacing:2px">${trackingId}</p>
        </div>
        <p>Use this ID to track the status of your complaint at any time.</p>
        <a href="${process.env.CLIENT_URL}/track/${trackingId}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#22d3ee;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700">
          Track Status →
        </a>
      </div>
    `,
  });
};

const sendStatusUpdateEmail = async (email, name, trackingId, status, category) => {
  const statusLabels = {
    assigned: 'Assigned to a worker 👷',
    in_progress: 'Work in Progress 🔧',
    completed: 'Resolved! ✅',
    rejected: 'Complaint Rejected ❌',
  };
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Update on your complaint — ${trackingId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px">
        <h1 style="color:#22d3ee">Status Update</h1>
        <p>Hi ${name}, your complaint (${category}) has been updated.</p>
        <div style="background:#1e293b;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#94a3b8">New Status</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#4ade80">${statusLabels[status] || status}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/track/${trackingId}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#22d3ee;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700">
          View Details →
        </a>
      </div>
    `,
  });
};

const sendAssignmentEmail = async (workerEmail, workerName, report) => {
  await transporter.sendMail({
    from: FROM,
    to: workerEmail,
    subject: `New Task Assigned — ${report.trackingId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px">
        <h1 style="color:#f59e0b">New Task Assigned 📋</h1>
        <p>Hi ${workerName}, you have been assigned a new complaint to resolve.</p>
        <div style="background:#1e293b;padding:16px;border-radius:8px;margin:16px 0">
          <p><strong>Tracking ID:</strong> ${report.trackingId}</p>
          <p><strong>Category:</strong> ${report.category?.name || 'N/A'}</p>
          <p><strong>Address:</strong> ${report.location?.address || 'See map'}</p>
          <p><strong>Priority:</strong> ${report.priority?.toUpperCase()}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/worker/tasks" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f59e0b;color:#0f172a;border-radius:8px;text-decoration:none;font-weight:700">
          View Task →
        </a>
      </div>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendComplaintReceivedEmail,
  sendStatusUpdateEmail,
  sendAssignmentEmail,
};
