import { useState } from 'react';
import { Search, FileText, Printer, Trash2, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import InvoiceModal from '../components/InvoiceModal';

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-DZ');

export default function Invoices() {
  const { invoices, reservations, removeInvoice } = useApp();
  const [search, setSearch] = useState('');
  const [openInvoice, setOpenInvoice] = useState(null);

  const filtered = invoices.filter(i => {
    const text = `${i.invoiceNumber} ${i.firstName} ${i.lastName} ${i.brand} ${i.model} ${i.plate}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalAmount = filtered.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalPaid   = filtered.reduce((s, i) => s + (i.paidAmount || 0), 0);

  const handleOpen = (inv) => {
    const res = reservations.find(r => r.id === inv.reservationId);
    if (!res) return alert('Réservation introuvable (peut-être supprimée)');
    setOpenInvoice({ reservation: res, existing: inv });
  };

  const handleDelete = async (inv) => {
    if (!confirm(`Supprimer la facture ${inv.invoiceNumber} ?`)) return;
    try { await removeInvoice(inv.id); }
    catch (e) { alert('Erreur : ' + e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Factures</h1>
          <p className="page-subtitle">{invoices.length} facture{invoices.length > 1 ? 's' : ''} enregistrée{invoices.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: 'var(--primary-soft)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total facturé</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{fmt(totalAmount)} DA</div>
        </div>
        <div style={{ flex: 1, background: 'var(--success-soft)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Encaissé</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{fmt(totalPaid)} DA</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reste à percevoir</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)', marginTop: 4 }}>{fmt(totalAmount - totalPaid)} DA</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ maxWidth: 480 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par N° facture, client, véhicule..." />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          <FileText size={48} style={{ color: 'var(--text-3)', opacity: 0.4, marginBottom: 16 }} />
          <h3 style={{ color: 'var(--text-2)', margin: '8px 0' }}>Aucune facture enregistrée</h3>
          <p style={{ color: 'var(--text-3)', fontSize: 13, maxWidth: 420, margin: '0 auto' }}>
            Pour enregistrer une facture, allez dans <strong>Réservations</strong>, ouvrez une réservation,
            cliquez sur <strong>"Facture"</strong> puis sur le bouton vert <strong>"Enregistrer"</strong>.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Montant</th>
                  <th>Payé</th>
                  <th>Solde</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const balance = (i.totalAmount || 0) - (i.paidAmount || 0);
                  return (
                    <tr key={i.id}>
                      <td><strong style={{ color: 'var(--primary)' }}>{i.invoiceNumber}</strong></td>
                      <td style={{ fontSize: 12 }}>{format(parseISO(i.issueDate), 'dd MMM yyyy', { locale: fr })}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{i.firstName} {i.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{i.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{i.brand} {i.model}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{i.plate}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{fmt(i.totalAmount)} DA</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(i.paidAmount)} DA</td>
                      <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                        {balance > 0 ? `-${fmt(balance)}` : '✓'} {balance > 0 && 'DA'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="action-btn" title="Voir / Imprimer" onClick={() => handleOpen(i)}>
                            <Printer size={14} style={{ color: 'var(--primary)' }} />
                          </button>
                          <button className="action-btn" title="Supprimer" onClick={() => handleDelete(i)}>
                            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openInvoice && (
        <InvoiceModal
          reservation={openInvoice.reservation}
          existingInvoice={openInvoice.existing}
          onClose={() => setOpenInvoice(null)}
        />
      )}
    </div>
  );
}
