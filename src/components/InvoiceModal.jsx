import { X, Printer, Save, Check } from 'lucide-react';
import { useState } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';

const formatDA = (n) => (Number(n) || 0).toLocaleString('fr-DZ');

export default function InvoiceModal({ reservation, onClose, existingInvoice = null }) {
  const { clients, vehicles, invoices, addInvoice } = useApp();
  const { settings } = useSettings();
  const [savedInvoice, setSavedInvoice] = useState(existingInvoice);
  const [saving, setSaving] = useState(false);

  // Vérifier s'il y a déjà une facture pour cette réservation
  const alreadyExists = existingInvoice
    || (invoices && invoices.find(i => i.reservationId === reservation.id))
    || savedInvoice;

  const client  = clients.find(c => c.id === reservation.clientId);
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);

  const start = parseISO(reservation.startDate);
  const end   = parseISO(reservation.endDate);
  const days  = Math.max(1, differenceInDays(end, start));
  const daily = vehicle?.pricePerDay || 0;
  const subtotal = days * daily;
  const total    = reservation.totalPrice || subtotal;
  const paid     = reservation.paidAmount || 0;
  const remaining = total - paid;
  const deposit  = reservation.deposit || 0;

  // Si déjà enregistrée → utiliser le numéro et la date stockés
  const invoiceNum = alreadyExists?.invoiceNumber || `FAC-${String(reservation.id).padStart(5, '0')} (brouillon)`;
  const issueDate  = alreadyExists?.issueDate
    ? format(parseISO(alreadyExists.issueDate), 'dd MMMM yyyy', { locale: fr })
    : format(new Date(), 'dd MMMM yyyy', { locale: fr });

  const handlePrint = () => window.print();

  const handleSave = async () => {
    setSaving(true);
    try {
      const inv = await addInvoice({ reservationId: reservation.id });
      setSavedInvoice(inv);
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally { setSaving(false); }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-printable, #invoice-printable * { visibility: visible !important; }
          #invoice-printable {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #invoice-controls { display: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div style={styles.overlay}>
        <div id="invoice-controls" style={styles.controls}>
          <div style={{ display: 'flex', gap: 8 }}>
            {alreadyExists ? (
              <span style={{ ...styles.btnGhost, background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}>
                <Check size={16} /> Facture enregistrée
              </span>
            ) : (
              <button onClick={handleSave} disabled={saving} style={{ ...styles.btnSave, opacity: saving ? 0.7 : 1 }}>
                <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            )}
            <button onClick={handlePrint} style={styles.btnPrimary}>
              <Printer size={16} /> Imprimer
            </button>
            <button onClick={onClose} style={styles.btnGhost}>
              <X size={16} /> Fermer
            </button>
          </div>
        </div>

        <div id="invoice-printable" style={styles.paper}>
          {/* En-tête */}
          <div style={styles.header}>
            <div>
              <div style={styles.brand}>{settings.agencyName || 'AutoLoc'}</div>
              <div style={styles.brandSub}>{settings.tagline || 'Location de véhicules'}</div>
              {settings.address && <div style={styles.contact}>{settings.address}</div>}
              {settings.phone   && <div style={styles.contact}>Tél : {settings.phone}</div>}
              {settings.email   && <div style={styles.contact}>{settings.email}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={styles.invoiceTitle}>FACTURE</div>
              <div style={styles.invoiceNum}>N° {invoiceNum}</div>
              <div style={styles.invoiceDate}>Date : {issueDate}</div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Client & Véhicule */}
          <div style={styles.row2}>
            <div style={styles.box}>
              <div style={styles.boxTitle}>FACTURÉ À</div>
              {client ? (
                <>
                  <div style={styles.boxBig}>{client.firstName} {client.lastName}</div>
                  {client.phone   && <div style={styles.boxLine}>Tél : {client.phone}</div>}
                  {client.email   && <div style={styles.boxLine}>{client.email}</div>}
                  {client.address && <div style={styles.boxLine}>{client.address}</div>}
                  {client.licenseNumber && <div style={styles.boxLine}>Permis n° {client.licenseNumber}</div>}
                </>
              ) : <div>—</div>}
            </div>
            <div style={styles.box}>
              <div style={styles.boxTitle}>VÉHICULE LOUÉ</div>
              {vehicle ? (
                <>
                  <div style={styles.boxBig}>{vehicle.brand} {vehicle.model}</div>
                  <div style={styles.boxLine}>Année {vehicle.year} · {vehicle.category}</div>
                  <div style={styles.boxLine}>Immatriculation : {vehicle.plate}</div>
                  <div style={styles.boxLine}>{vehicle.fuel} · {vehicle.transmission}</div>
                </>
              ) : <div>—</div>}
            </div>
          </div>

          {/* Période */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>PÉRIODE DE LOCATION</div>
            <div style={styles.periodGrid}>
              <PeriodItem label="Date de départ" value={format(start, 'EEEE dd MMMM yyyy', { locale: fr })} />
              <PeriodItem label="Date de retour" value={format(end, 'EEEE dd MMMM yyyy', { locale: fr })} />
              <PeriodItem label="Durée" value={`${days} jour${days > 1 ? 's' : ''}`} />
              <PeriodItem label="Km autorisés" value={`${formatDA(reservation.kmLimit || 0)} km`} />
            </div>
          </div>

          {/* Tableau de facturation */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: 'left' }}>Description</th>
                <th style={styles.th}>Quantité</th>
                <th style={styles.th}>Prix unitaire</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>
                  Location {vehicle?.brand} {vehicle?.model} ({vehicle?.plate})
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{days} jour{days > 1 ? 's' : ''}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{formatDA(daily)} {settings.currency}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>{formatDA(subtotal)} {settings.currency}</td>
              </tr>
              {reservation.extraKmPrice > 0 && (
                <tr>
                  <td style={styles.tdSmall} colSpan={4}>
                    ↳ Km supplémentaire facturé : {formatDA(reservation.extraKmPrice)} {settings.currency} / km au-delà de {formatDA(reservation.kmLimit)} km
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={styles.tfLabel}>Sous-total</td>
                <td style={styles.tfValue}>{formatDA(total)} {settings.currency}</td>
              </tr>
              {deposit > 0 && (
                <tr>
                  <td colSpan={3} style={styles.tfLabel}>Caution (remboursable)</td>
                  <td style={styles.tfValue}>{formatDA(deposit)} {settings.currency}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} style={{ ...styles.tfLabel, fontSize: 14, fontWeight: 700 }}>TOTAL À PAYER</td>
                <td style={{ ...styles.tfValue, fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>{formatDA(total)} {settings.currency}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ ...styles.tfLabel, color: '#10b981' }}>Déjà payé</td>
                <td style={{ ...styles.tfValue, color: '#10b981' }}>{formatDA(paid)} {settings.currency}</td>
              </tr>
              {remaining > 0 && (
                <tr>
                  <td colSpan={3} style={{ ...styles.tfLabel, color: '#ef4444', fontWeight: 700 }}>Reste à payer</td>
                  <td style={{ ...styles.tfValue, color: '#ef4444', fontWeight: 800, fontSize: 14 }}>{formatDA(remaining)} {settings.currency}</td>
                </tr>
              )}
            </tfoot>
          </table>

          {/* Paiement */}
          {reservation.paymentMethod && (
            <div style={styles.paymentInfo}>
              <strong>Mode de paiement :</strong> {reservation.paymentMethod}
            </div>
          )}

          {/* Notes */}
          {reservation.notes && (
            <div style={styles.notes}>
              <div style={styles.notesTitle}>Notes</div>
              <div>{reservation.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.signatures}>
              <div style={styles.sigBox}>
                <div style={styles.sigLabel}>Signature du client</div>
                <div style={styles.sigLine} />
              </div>
              <div style={styles.sigBox}>
                <div style={styles.sigLabel}>Signature de l'agence</div>
                <div style={styles.sigLine} />
              </div>
            </div>
            <div style={styles.thanks}>
              Merci de votre confiance — {settings.agencyName || 'AutoLoc'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PeriodItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{value}</div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, overflow: 'auto', padding: 24 },
  controls: { position: 'sticky', top: 0, display: 'flex', justifyContent: 'flex-end', marginBottom: 16, zIndex: 1 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#0a0a0f', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnSave:    { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnGhost:   { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 },
  paper: { maxWidth: 820, margin: '0 auto', background: '#fff', color: '#111', padding: '40px 48px', borderRadius: 6, fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  brand: { fontSize: 28, fontWeight: 800, color: '#f59e0b', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -0.5 },
  brandSub: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 10 },
  contact: { fontSize: 11, color: '#555', lineHeight: 1.6 },
  invoiceTitle: { fontSize: 32, fontWeight: 800, color: '#111', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -1 },
  invoiceNum: { fontSize: 13, fontWeight: 600, color: '#555', marginTop: 4 },
  invoiceDate: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 2, background: '#f59e0b', marginBottom: 24, borderRadius: 2 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  box: { padding: 16, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 },
  boxTitle: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 },
  boxBig: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 },
  boxLine: { fontSize: 12, color: '#444', lineHeight: 1.7 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 700 },
  periodGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 14, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 16 },
  th: { padding: '10px 12px', background: '#111', color: '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, textAlign: 'center' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: 13, color: '#333' },
  tdSmall: { padding: '6px 12px 10px 24px', fontSize: 11, color: '#888', fontStyle: 'italic' },
  tfLabel: { padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#555', fontWeight: 500 },
  tfValue: { padding: '8px 12px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#111' },
  paymentInfo: { padding: '10px 14px', background: '#fafafa', border: '1px solid #eee', borderRadius: 6, fontSize: 12, color: '#444', marginBottom: 16 },
  notes: { padding: 14, background: '#fff8e1', border: '1px solid #f5d97a', borderRadius: 6, marginBottom: 24, fontSize: 12, color: '#666' },
  notesTitle: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 },
  footer: { marginTop: 32, borderTop: '1px solid #eee', paddingTop: 20 },
  signatures: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 24 },
  sigBox: {},
  sigLabel: { fontSize: 11, color: '#888', marginBottom: 30 },
  sigLine: { borderBottom: '1px solid #333', height: 1 },
  thanks: { textAlign: 'center', fontSize: 11, color: '#888', fontStyle: 'italic' },
};
