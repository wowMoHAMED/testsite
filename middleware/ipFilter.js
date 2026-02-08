

module.exports = (req, res, next) => {
  if (!process.env.ADMIN_ALLOWED_IPS) {
    return res.status(500).send('Configuration IP manquante');
  }

  let ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    req.ip;
if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
if (ip === '::1') ip = '127.0.0.1';


  const allowedIPs = process.env.ADMIN_ALLOWED_IPS
    .split(',')
    .map(i => i.trim());

  console.log('IP:', ip);

  if (!allowedIPs.includes(ip)) {
    return res.status(403).send('⛔ Accès refusé (IP)');
  }

  next();
};
