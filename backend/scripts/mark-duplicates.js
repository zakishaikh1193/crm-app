import pool from '../config/database.js';

async function markDuplicates() {
  // 1. Mark duplicates by email
  const [emailDupRows] = await pool.execute(`
    SELECT e.email, GROUP_CONCAT(e.contact_id) as ids, COUNT(*) as cnt
    FROM emails e
    WHERE e.email IS NOT NULL AND TRIM(e.email) <> ''
    GROUP BY e.email
    HAVING cnt > 1
  `);
  for (const row of emailDupRows) {
    const ids = row.ids.split(',').map(Number);
    const masterId = ids[0];
    for (const dupId of ids.slice(1)) {
      await pool.execute(
        'UPDATE contacts SET is_duplicate = 1, duplicate_of = ? WHERE id = ? AND (is_duplicate = 0 OR is_duplicate IS NULL)',
        [masterId, dupId]
      );
      console.log(`Marked contact ${dupId} as duplicate of ${masterId} (by email: ${row.email})`);
    }
  }

  // 2. Mark duplicates by first_name + last_name + company_id (for contacts not already marked as duplicate)
  const [nameCompanyDupRows] = await pool.execute(`
    SELECT c.first_name, c.last_name, c.company_id, GROUP_CONCAT(c.id) as ids, COUNT(*) as cnt
    FROM contacts c
    WHERE (c.is_duplicate = 0 OR c.is_duplicate IS NULL)
      AND c.first_name IS NOT NULL AND c.last_name IS NOT NULL AND c.company_id IS NOT NULL
    GROUP BY c.first_name, c.last_name, c.company_id
    HAVING cnt > 1
  `);
  for (const row of nameCompanyDupRows) {
    const ids = row.ids.split(',').map(Number);
    const masterId = ids[0];
    for (const dupId of ids.slice(1)) {
      await pool.execute(
        'UPDATE contacts SET is_duplicate = 1, duplicate_of = ? WHERE id = ? AND (is_duplicate = 0 OR is_duplicate IS NULL)',
        [masterId, dupId]
      );
      console.log(`Marked contact ${dupId} as duplicate of ${masterId} (by name/company: ${row.first_name} ${row.last_name}, company_id: ${row.company_id})`);
    }
  }

  console.log('Duplicate marking complete.');
  process.exit(0);
}

markDuplicates().catch(err => {
  console.error('Error marking duplicates:', err);
  process.exit(1);
}); 