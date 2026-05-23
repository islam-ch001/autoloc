const router = require('express').Router();
const pool = require('../db/pool');
const { getMachineId, validateKey, formatKey } = require('../lib/license');

// GET /api/license/status — verifie si l'app est activee sur ce PC
router.get('/status', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, machine_id, activated_at FROM license WHERE id = 1');
    if (!rows.length) {
      return res.json({ activated: false, machineId: getMachineId() });
    }
    const stored = rows[0];
    const currentMachine = getMachineId();
    // Verifie que la machine n'a pas change
    if (stored.machine_id !== currentMachine) {
      return res.json({
        activated: false,
        error: 'machine_mismatch',
        message: 'Cette licence est liée à un autre ordinateur.',
        machineId: currentMachine,
      });
    }
    // Re-verifie la cle (au cas ou)
    if (!validateKey(stored.key)) {
      return res.json({ activated: false, error: 'invalid_key', machineId: currentMachine });
    }
    res.json({
      activated: true,
      key: formatKey(stored.key),
      activatedAt: stored.activated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/license/activate { key }
router.post('/activate', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Cle d\'activation requise' });

    if (!validateKey(key)) {
      return res.status(400).json({ error: 'Cle invalide. Verifiez que vous l\'avez bien saisie.' });
    }

    const machineId = getMachineId();
    const cleanKey = String(key).toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Verifier qu'on n'a pas deja une licence pour un AUTRE PC
    const { rows: existing } = await pool.query('SELECT machine_id FROM license WHERE id = 1');
    if (existing.length && existing[0].machine_id !== machineId) {
      return res.status(403).json({
        error: 'Cette installation est deja liee a un autre ordinateur. Contactez le support pour transferer votre licence.',
      });
    }

    // Insert ou update
    if (existing.length) {
      await pool.query('UPDATE license SET key = $1, machine_id = $2, activated_at = datetime(\'now\') WHERE id = 1', [cleanKey, machineId]);
    } else {
      await pool.query('INSERT INTO license (id, key, machine_id) VALUES (1, $1, $2)', [cleanKey, machineId]);
    }

    res.json({
      activated: true,
      key: formatKey(cleanKey),
      machineId,
      message: 'Licence activée avec succès !',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
