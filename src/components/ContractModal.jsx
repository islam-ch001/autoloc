import { X, Printer, FileSignature } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';

const formatDA = (n) => (Number(n) || 0).toLocaleString('fr-DZ');

export default function ContractModal({ reservation, onClose }) {
  const { clients, vehicles } = useApp();
  const { settings } = useSettings();

  const client  = clients.find(c => c.id === reservation.clientId);
  const vehicle = vehicles.find(v => v.id === reservation.vehicleId);

  const start = parseISO(reservation.startDate);
  const end   = parseISO(reservation.endDate);
  const days  = Math.max(1, differenceInDays(end, start));
  const daily = vehicle?.pricePerDay || 0;
  const total    = reservation.totalPrice || days * daily;
  const deposit  = reservation.deposit || 0;
  const kmLimit  = reservation.kmLimit || 0;
  const extraKm  = reservation.extraKmPrice || 0;

  const contractNum = `CONT-${String(reservation.displayId || reservation.id).padStart(5, '0')}`;
  const issueDate  = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  const lieu = settings.address?.split(',').pop()?.trim() || 'Algérie';

  const buildPrintableHtml = () => {
    const node = document.getElementById('contract-printable');
    if (!node) return '';
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${contractNum}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: white; font-family: Inter, system-ui, sans-serif; color: #111; }
        @page { size: A4; margin: 0; }
        #contract-printable {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto !important;
          padding: 13mm 16mm !important;
          background: white !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      </style>
    </head><body>${node.outerHTML}</body></html>`;
  };

  const handlePrint = async () => {
    const html = buildPrintableHtml();
    if (!html) return;
    if (typeof window !== 'undefined' && window.autoloc?.printInvoicePdf) {
      const res = await window.autoloc.printInvoicePdf({ html, invoiceNum: contractNum.replace(/[^A-Za-z0-9_-]/g, '_') });
      if (!res?.ok) alert("Erreur PDF : " + (res?.error || 'inconnue'));
      return;
    }
    const w = window.open('', '_blank', 'width=900,height=1100,menubar=no,toolbar=no');
    if (!w) { alert("Autorisez les popups."); return; }
    const htmlAuto = html.replace('</body>',
      `<script>window.addEventListener('load',()=>{setTimeout(()=>window.print(),300)});window.addEventListener('afterprint',()=>window.close());</script></body>`);
    w.document.write(htmlAuto);
    w.document.close();
  };

  return (
    <div style={styles.overlay}>
      <div id="invoice-controls" style={styles.controls}>
        <button onClick={handlePrint} style={styles.btnPrimary}><Printer size={16} /> Imprimer</button>
        <button onClick={onClose} style={styles.btnGhost}><X size={16} /> Fermer</button>
      </div>

      <div id="contract-printable" style={styles.paper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {settings.logo && (
              <img src={settings.logo} alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, background: '#fff', border: '1px solid #eee', flexShrink: 0 }} />
            )}
            <div>
              <div style={styles.brand}>{settings.agencyName || 'AutoLoc'}</div>
              <div style={styles.brandSub}>{settings.tagline || 'Location de véhicules'}</div>
              {settings.address && <div style={styles.contact}>{settings.address}</div>}
              {settings.phone   && <div style={styles.contact}>Tél : {settings.phone}</div>}
              {settings.email   && <div style={styles.contact}>{settings.email}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.title}>CONTRAT DE LOCATION</div>
            <div style={styles.num}>N° {contractNum}</div>
            <div style={styles.dateInfo}>Date : {issueDate}</div>
            <div style={styles.dateInfo}>Lieu : {lieu}</div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Préambule */}
        <p style={styles.preamble}>
          Entre les soussignés, il est convenu et arrêté ce qui suit :
        </p>

        {/* Parties */}
        <div style={styles.row2}>
          <div style={styles.box}>
            <div style={styles.boxTitle}>LE LOUEUR</div>
            <div style={styles.boxBig}>{settings.agencyName || 'AutoLoc'}</div>
            {settings.address && <div style={styles.boxLine}>{settings.address}</div>}
            {settings.phone   && <div style={styles.boxLine}>Tél : {settings.phone}</div>}
            {settings.email   && <div style={styles.boxLine}>{settings.email}</div>}
            <div style={styles.boxLine}>Ci-après dénommé « <strong>le Loueur</strong> »</div>
          </div>
          <div style={styles.box}>
            <div style={styles.boxTitle}>LE LOCATAIRE</div>
            {client ? (
              <>
                <div style={styles.boxBig}>{client.firstName} {client.lastName}</div>
                {client.phone        && <div style={styles.boxLine}>Tél : {client.phone}</div>}
                {client.email        && <div style={styles.boxLine}>{client.email}</div>}
                {client.address      && <div style={styles.boxLine}>{client.address}</div>}
                {client.licenseNumber && <div style={styles.boxLine}>Permis de conduire N° {client.licenseNumber} (cat. {client.license})</div>}
                <div style={styles.boxLine}>Ci-après dénommé « <strong>le Locataire</strong> »</div>
              </>
            ) : <div>—</div>}
          </div>
        </div>

        {/* Article 1 - Objet */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 1 — Objet du contrat</div>
          <p style={styles.text}>
            Le Loueur met à la disposition du Locataire, qui l'accepte, le véhicule désigné ci-après,
            pour la période et aux conditions définies dans le présent contrat.
          </p>
        </div>

        {/* Article 2 - Véhicule */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 2 — Désignation du véhicule</div>
          {vehicle && (
            <div style={styles.vehicleGrid}>
              <Info label="Marque" value={vehicle.brand} />
              <Info label="Modèle" value={vehicle.model} />
              <Info label="Année" value={vehicle.year} />
              <Info label="Catégorie" value={vehicle.category} />
              <Info label="Carburant" value={vehicle.fuel} />
              <Info label="Transmission" value={vehicle.transmission} />
              <Info label="Immatriculation" value={vehicle.plate} highlight />
              <Info label="Km au départ" value={`${formatDA(vehicle.mileage)} km`} />
            </div>
          )}
        </div>

        {/* Article 3 - Durée */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 3 — Durée de la location</div>
          <div style={styles.periodGrid}>
            <Info label="Date / heure de départ" value={format(start, 'EEEE dd MMMM yyyy', { locale: fr })} />
            <Info label="Date / heure de retour" value={format(end, 'EEEE dd MMMM yyyy', { locale: fr })} />
            <Info label="Durée totale" value={`${days} jour${days > 1 ? 's' : ''}`} />
          </div>
        </div>

        {/* Article 4 - Conditions financières */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 4 — Conditions financières</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>Tarif journalier</td>
                <td style={styles.tdValue}>{formatDA(daily)} {settings.currency || 'DA'}</td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Nombre de jours</td>
                <td style={styles.tdValue}>{days}</td>
              </tr>
              <tr>
                <td style={{ ...styles.tdLabel, fontWeight: 700 }}>Montant total de la location</td>
                <td style={{ ...styles.tdValue, fontWeight: 800, fontSize: 14, color: '#f59e0b' }}>{formatDA(total)} {settings.currency || 'DA'}</td>
              </tr>
              {deposit > 0 && (
                <tr>
                  <td style={styles.tdLabel}>Caution (restituable)</td>
                  <td style={styles.tdValue}>{formatDA(deposit)} {settings.currency || 'DA'}</td>
                </tr>
              )}
              {reservation.paymentMethod && (
                <tr>
                  <td style={styles.tdLabel}>Mode de paiement</td>
                  <td style={styles.tdValue}>{reservation.paymentMethod}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Article 5 - Kilométrage */}
        {kmLimit > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Article 5 — Limite kilométrique</div>
            <p style={styles.text}>
              Le Locataire dispose d'un quota de <strong>{formatDA(kmLimit)} km</strong> pour toute la durée de la location.
              Tout kilomètre supplémentaire sera facturé <strong>{formatDA(extraKm)} {settings.currency || 'DA'} / km</strong>,
              à régler au moment du retour du véhicule.
            </p>
          </div>
        )}

        {/* Article 6 - Conditions générales */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 6 — Obligations du Locataire</div>
          <ol style={styles.list}>
            <li>Le Locataire s'engage à utiliser le véhicule en « bon père de famille » et exclusivement pour son usage personnel.</li>
            <li>Le véhicule doit être restitué dans l'état où il a été pris, avec le même niveau de carburant et propre.</li>
            <li>Il est strictement interdit de fumer dans le véhicule ou d'y transporter des animaux non protégés.</li>
            <li>Le Locataire ne peut sous-louer le véhicule, ni le confier à un tiers non déclaré sur ce contrat.</li>
            <li>En cas d'accident, le Locataire doit informer immédiatement le Loueur et les autorités, et remplir un constat amiable.</li>
            <li>Toute infraction au code de la route (excès de vitesse, stationnement, etc.) reste à la charge exclusive du Locataire.</li>
            <li>En cas de retard de restitution, une journée supplémentaire sera facturée par tranche entamée de 24 heures.</li>
          </ol>
        </div>

        {/* Article 7 - Assurance */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 7 — Assurance & responsabilité</div>
          <p style={styles.text}>
            Le véhicule est couvert par une assurance « tous risques » incluant la responsabilité civile. La franchise reste
            à la charge du Locataire en cas de sinistre responsable. Le vol et les dommages volontaires ne sont pas couverts.
          </p>
        </div>

        {/* Article 8 - Litiges */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Article 8 — Juridiction compétente</div>
          <p style={styles.text}>
            En cas de litige relatif à l'exécution du présent contrat, les parties s'efforceront de trouver
            un accord amiable. À défaut, le tribunal compétent sera celui du ressort de l'agence du Loueur.
          </p>
        </div>

        {/* Mention manuscrite + signatures */}
        <div style={styles.section}>
          <p style={{ ...styles.text, fontStyle: 'italic', color: '#555' }}>
            Le Locataire reconnaît avoir lu, compris et accepté l'intégralité des clauses du présent contrat,
            ainsi que l'état du véhicule au moment de la prise en charge.
          </p>
        </div>

        <div style={styles.signatures}>
          <div style={styles.sigBox}>
            <div style={styles.sigLabel}>Fait à {lieu}, le {issueDate}</div>
            <div style={styles.sigSubLabel}>Le Locataire (« Lu et approuvé » + signature)</div>
            <div style={styles.sigLine} />
          </div>
          <div style={styles.sigBox}>
            <div style={styles.sigLabel}>&nbsp;</div>
            <div style={styles.sigSubLabel}>Le Loueur (signature + cachet)</div>
            <div style={styles.sigLine} />
          </div>
        </div>

        <div style={styles.footer}>
          <FileSignature size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Contrat établi en deux exemplaires originaux, un pour chacune des parties. — {settings.agencyName || 'AutoLoc'}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: highlight ? 800 : 600, color: highlight ? '#0a0a0f' : '#111' }}>{value || '—'}</div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, overflow: 'auto', padding: 24 },
  controls: { position: 'sticky', top: 0, display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 8, zIndex: 1 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#0a0a0f', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnGhost:   { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 },
  paper: { width: '210mm', minHeight: '297mm', margin: '0 auto', background: '#fff', color: '#111', padding: '13mm 16mm', borderRadius: 4, fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  brand: { fontSize: 22, fontWeight: 800, color: '#f59e0b', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -0.5 },
  brandSub: { fontSize: 11, color: '#888', marginTop: 2, marginBottom: 6 },
  contact: { fontSize: 10, color: '#555', lineHeight: 1.5 },
  title: { fontSize: 24, fontWeight: 800, color: '#111', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -0.5 },
  num: { fontSize: 12, fontWeight: 600, color: '#555', marginTop: 4 },
  dateInfo: { fontSize: 11, color: '#888' },
  divider: { height: 2, background: '#f59e0b', marginBottom: 14, borderRadius: 2 },
  preamble: { fontSize: 12, color: '#444', fontStyle: 'italic', marginBottom: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 },
  box: { padding: 12, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 },
  boxTitle: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 },
  boxBig: { fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 },
  boxLine: { fontSize: 11, color: '#444', lineHeight: 1.6 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 800, color: '#0a0a0f', borderBottom: '1px solid #f59e0b', paddingBottom: 4, marginBottom: 8 },
  text: { fontSize: 11.5, color: '#333', lineHeight: 1.6, margin: 0 },
  vehicleGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: 10, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 },
  periodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: 10, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 },
  table: { width: '100%', borderCollapse: 'collapse' },
  tdLabel: { padding: '6px 10px', fontSize: 12, color: '#444', borderBottom: '1px solid #eee' },
  tdValue: { padding: '6px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#111', borderBottom: '1px solid #eee' },
  list: { fontSize: 11, color: '#333', lineHeight: 1.7, paddingLeft: 18, margin: 0 },
  signatures: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 18, marginBottom: 12 },
  sigBox: {},
  sigLabel: { fontSize: 11, color: '#444', marginBottom: 6 },
  sigSubLabel: { fontSize: 10, color: '#777', marginBottom: 26 },
  sigLine: { borderBottom: '1px solid #333', height: 1 },
  footer: { textAlign: 'center', fontSize: 10, color: '#888', fontStyle: 'italic', marginTop: 14, borderTop: '1px solid #eee', paddingTop: 8 },
};
