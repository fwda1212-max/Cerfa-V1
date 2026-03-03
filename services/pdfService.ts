import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { CompanyProfile, WorkRequest } from "../types";

/**
 * Generates a filled CERFA 14024*01 PDF using the official form fields.
 *
 * IMPORTANT: Place the file "cerfa_14024-01_V1.pdf" (renamed to "cerfaTemplate.pdf")
 * inside the /public/ folder of your project so it is accessible at /cerfaTemplate.pdf.
 */
export const generateCerfaPDF = async (profile: CompanyProfile, request: WorkRequest) => {
  console.log("Starting PDF generation...", { profile, request });

  // 1. Load the official CERFA template
  let pdfDoc: PDFDocument;
  try {
    const response = await fetch('/cerfaTemplate.pdf');
    if (!response.ok) {
      throw new Error(`Template not found: ${response.status} ${response.statusText}`);
    }
    
    // Check if the file is base64 encoded (common when saved via text tools)
    const text = await response.text();
    let pdfBytes: Uint8Array;
    
    if (text.trim().startsWith('JVBERi')) {
      console.log("Detected base64 encoded PDF template, decoding...");
      const binaryString = atob(text.trim());
      pdfBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pdfBytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      console.log("Detected binary PDF template.");
      const buffer = await response.arrayBuffer();
      pdfBytes = new Uint8Array(buffer);
    }
    
    pdfDoc = await PDFDocument.load(pdfBytes);
  } catch (loadError) {
    console.error(
      "Could not load cerfaTemplate.pdf from /public/. " +
      "Make sure the file exists in the Public/ folder.",
      loadError
    );
    throw new Error(
      "Le fichier cerfaTemplate.pdf est introuvable dans le dossier Public/. " +
      "Veuillez y déposer le PDF officiel du CERFA 14024*01 renommé en cerfaTemplate.pdf."
    );
  }

  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages.length > 1 ? pages[1] : null;

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Helper: fill a form text field
  const setText = (fieldId: string, value: string) => {
    try {
      form.getTextField(fieldId).setText(value ?? '');
    } catch {
      console.warn(`TextField not found: "${fieldId}"`);
    }
  };

  // Helper: check a form checkbox
  const checkBox = (fieldId: string, shouldCheck: boolean = true) => {
    try {
      const cb = form.getCheckBox(fieldId);
      shouldCheck ? cb.check() : cb.uncheck();
    } catch {
      console.warn(`Checkbox not found: "${fieldId}"`);
    }
  };

  // Helper: draw text directly on a page (for graphical digit-box fields)
  // In pdf-lib: x=0 is LEFT, y=0 is BOTTOM of the page.
  const drawOn = (
    page: typeof page1,
    text: string,
    x: number,
    y: number,
    size: number = 9
  ) => {
    if (!text) return;
    page.drawText(text, { x, y, size, font: helveticaFont, color: rgb(0, 0, 0) });
  };

  // Parse address into number + street name
  const splitAddress = (address: string): [string, string] => {
    const match = address.match(/^(\d+[a-zA-Z]?)\s+(.+)$/);
    if (match) return [match[1], match[2]];
    return ['', address];
  };

  const [addrNum, addrStreet] = splitAddress(profile.address);

  // Format date
  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return {
      dd: String(d.getDate()).padStart(2, '0'),
      mm: String(d.getMonth() + 1).padStart(2, '0'),
      yyyy: String(d.getFullYear()),
    };
  };

  // ── PAGE 1 ──────────────────────────────────────────────────────────────────

  // Section : Le demandeur
  checkBox('Entreprise');
  setText('Dénomination',      profile.companyName);
  setText('Représenté par',    profile.contactName);
  setText('Adresse  Numéro 1', addrNum);
  setText('Nom de la voie',    addrStreet);
  setText('Localité',          profile.city);
  setText('Pays',              'France');
  setText('Email_1',           profile.email);
  // Code postal & téléphone sont des champs graphiques (cases individuelles) — dessin direct
  drawOn(page1, profile.postalCode, 85, 619);
  drawOn(page1, profile.phone,      80, 599);

  // Section : Localisation du site
  checkBox('En agglomération');
  setText('Nom de la voie_3', request.locationAddress);
  setText('Localité_3',       request.locationCity);

  // Section : Nature et date des travaux
  checkBox('Non'); // Permission de voirie antérieure : Non
  const desc = request.workDescription ?? '';
  const L = 95;
  setText('Description des travaux 1', desc.substring(0, L));
  setText('Description des travaux 2', desc.substring(L, L * 2));
  setText('Description des travaux 3', desc.substring(L * 2, L * 3));
  setText('Description des travaux 4', desc.substring(L * 3, L * 4));

  // Date de début et durée des travaux (champs graphiques)
  if (request.startDate) {
    const { dd, mm, yyyy } = parseDate(request.startDate);
    drawOn(page1, dd,   182, 200);
    drawOn(page1, mm,   206, 200);
    drawOn(page1, yyyy, 230, 200);
  }
  drawOn(page1, String(request.durationDays), 482, 200);

  // Section : Réglementation souhaitée
  drawOn(page1, String(request.durationDays), 241, 155); // Durée réglementation
  if (request.startDate) {
    const { dd, mm, yyyy } = parseDate(request.startDate);
    drawOn(page1, dd,   421, 155);  // Date début réglementation
    drawOn(page1, mm,   445, 155);
    drawOn(page1, yyyy, 469, 155);
  }

  if (request.trafficType === 'section_courante') checkBox('Restriction sur section courante');
  else if (request.trafficType === 'bretelle')    checkBox('Restriction sur bretelles');

  if (request.trafficDirection === 'bidirectionnel') {
    checkBox('undefined'); // "Deux sens de circulation"
  } else {
    checkBox('Sens des Points de Repères PR décroissants');
  }

  switch (request.trafficRegulation) {
    case 'alternat':
      drawOn(page1, 'X', 228, 54); // Case "Par feux tricolores"
      break;
    case 'route_barree':
      checkBox('undefined_3'); // "Fermeture à la circulation"
      break;
    case 'restriction_chaussee':
      checkBox('Empiètement sur chaussée');
      break;
  }

  // ── PAGE 2 ──────────────────────────────────────────────────────────────────
  if (page2) {
    const drawP2 = (text: string, x: number, y: number, size: number = 9) =>
      drawOn(page2, text, x, y, size);

    if (request.trafficRegulation === 'stationnement_interdit') checkBox('véhicules légers');
    if (request.trafficRegulation === 'route_barree')           checkBox('Véhicules légers');
    if (request.trafficRegulation === 'vitesse_limitee')        drawP2('30', 165, 715, 10);

    checkBox('Une entreprise spécialité');
    const [addrNum2, addrStreet2] = splitAddress(profile.address);
    setText('Dénomination_2',      profile.companyName);
    setText('Représenté par_2',    profile.contactName);
    setText('Adresse  Numéro 1_4', addrNum2);
    setText('Nom de la voie_4',    addrStreet2);
    setText('Localité_4',          profile.city);
    setText('Pays_3',              'France');
    drawP2(profile.postalCode, 90, 453);

    checkBox('Jatteste de lexactitude des informations fournies');
    const today = new Date().toLocaleDateString('fr-FR');
    drawP2(profile.city, 70, 563, 10);
    drawP2(today,        162, 563, 10);

    const nameParts = profile.contactName.trim().split(/\s+/);
    setText('Prénom_4', nameParts[0] ?? '');
    setText('Nom_4',    nameParts.slice(1).join(' ') || profile.contactName);
    setText('Qualité',  'Gérant');
  }

  // Save & trigger download
  const pdfBytes = await pdfDoc.save();
  const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `CERFA_14024-01_${profile.companyName.replace(/\s+/g, '_')}_${request.locationCity}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("PDF generation and download complete.");
};
