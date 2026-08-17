const net = require('net');
const tls = require('tls');
const { config } = require('../config/env');
const logger = require('../utils/logger');

const escapeHeader = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim();
const resetUrl = (token) => `${config.email.passwordResetUrl}?token=${encodeURIComponent(token)}`;

const readResponse = (socket) => new Promise((resolve, reject) => {
  let buffer = '';
  const onData = (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split(/\r?\n/).filter(Boolean);
    const last = lines[lines.length - 1];
    if (last && /^\d{3} /.test(last)) {
      socket.off('data', onData);
      const code = Number(last.slice(0, 3));
      if (code >= 400) reject(new Error(`SMTP command failed with ${code}`));
      else resolve({ code, message: buffer });
    }
  };
  socket.on('data', onData);
  socket.once('error', reject);
});

const command = async (socket, line) => {
  socket.write(`${line}\r\n`);
  return readResponse(socket);
};

const connect = () => new Promise((resolve, reject) => {
  const socket = config.email.secure
    ? tls.connect(config.email.port, config.email.host, { servername: config.email.host }, () => resolve(socket))
    : net.connect(config.email.port, config.email.host, () => resolve(socket));
  socket.setTimeout(config.email.timeoutMs, () => socket.destroy(new Error('SMTP connection timed out')));
  socket.once('error', reject);
});

const upgradeToTls = (socket) => new Promise((resolve, reject) => {
  const secureSocket = tls.connect({ socket, servername: config.email.host }, () => resolve(secureSocket));
  secureSocket.once('error', reject);
});

async function sendSmtp({ to, subject, text }) {
  let socket = await connect();
  try {
    await readResponse(socket);
    await command(socket, `EHLO ${config.email.heloName}`);
    if (config.email.startTls && !config.email.secure) {
      await command(socket, 'STARTTLS');
      socket = await upgradeToTls(socket);
      await command(socket, `EHLO ${config.email.heloName}`);
    }
    if (config.email.user || config.email.password) {
      await command(socket, 'AUTH LOGIN');
      await command(socket, Buffer.from(config.email.user).toString('base64'));
      await command(socket, Buffer.from(config.email.password).toString('base64'));
    }
    await command(socket, `MAIL FROM:<${config.email.from}>`);
    await command(socket, `RCPT TO:<${to}>`);
    await command(socket, 'DATA');
    socket.write([
      `From: ${escapeHeader(config.email.from)}`,
      `To: ${escapeHeader(to)}`,
      `Subject: ${escapeHeader(subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      text.replace(/(^|\n)\./g, '$1..'),
      '.',
    ].join('\r\n') + '\r\n');
    await readResponse(socket);
    await command(socket, 'QUIT').catch(() => null);
  } finally {
    socket.end();
  }
}

async function sendPasswordResetEmail(user, token) {
  const link = resetUrl(token);
  const text = [
    `Hello ${user.name || 'there'},`,
    '',
    'A password reset was requested for your QueueIt account.',
    `Open this link to choose a new password: ${link}`,
    '',
    'This link expires in 60 minutes. If you did not request it, you can ignore this email.',
  ].join('\n');

  if (!config.email.host) {
    logger.warn('Password reset email skipped because SMTP_HOST is not configured', { userId: user._id });
    return { skipped: true, resetUrl: link };
  }

  await sendSmtp({ to: user.email, subject: 'Reset your QueueIt password', text });
  return { sent: true };
}

module.exports = { sendPasswordResetEmail, sendSmtp, resetUrl };
