import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { CompanyProfile, WorkRequest } from "../types";
import { CERFA_TEMPLATE_BASE64 } from './cerfaTemplate';

export const generateCerfaPDF = async (profile: CompanyProfile, request: WorkRequest) => {
  try {
    let pdfDoc: PDFDocument;
    
    // 1. Charger le template PDF
    try {
        pdfDoc = await PDFDocument.load(CERFA_TEMPLATE_BASE64);
    } catch (loadError) {
        console.error("Erreur chargement template. Utilisation PDF vierge.", loadError);
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595.28, 841.89]); // Format A4
    }

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    
    // --- Helpers pour dessiner ---

    // Dessiner du texte
    const draw = (text: string, x: number, y: number, size: number = 10, font = helveticaFont) => {
      if (!text) return;
      // Nettoyage basique du texte pour éviter les caractères non supportés par Helvetica standard
      const safeText = text.replace(/[^\x00-\xFF]/g, (char) => {
          // Mapping simple pour quelques caractères accentués courants si nécessaire
          return char; 
      });
      
      page1.drawText(safeText, { x, y, size, font, color: rgb(0, 0, 0) });
    };

    // Cocher une case (dessine un X)
    const check = (x: number, y: number, condition: boolean = true) => {
      if (condition) {
        page1.drawText('X', { x, y, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });
      }
    };

    // --- PAGE 1 : Remplissage ---

    // 1. LE DEMANDEUR
    // Case "Entreprise" (Haut droite)
    check(537, 747);

    // Nom / Prénom (Contact)
    draw(profile.contactName, 360, 727); // Ligne "Représenté par" est souvent plus adaptée pour une entreprise
    
    // Dénomination (Nom de l'entreprise)
    draw(profile.companyName, 100, 712);

    // Adresse (Numéro / Extension / Voie)
    draw(profile.address, 100, 697);

    // Code Postal
    // On dessine chaque chiffre ou le bloc entier
    draw(profile.postalCode, 105, 682, 11);
    
    // Localité
    draw(profile.city, 200, 682);
    
    // Pays
    draw("France", 450, 682);

    // Téléphone
    draw(profile.phone, 105, 667, 11);

    // Courriel
    draw(profile.email, 80, 652);


    // 2. LOCALISATION DU SITE
    
    // Voie concernée
    const fullRoadName = request.locationAddress;
    let yRoad = 572;
    // On essaie de cocher la bonne case de type de voie
    if (request.trafficType === 'section_courante') {
       // Par défaut on écrit sur "Voie communale" ou on détecte selon le nom
       check(490, 575); // Coche Voie Communale approx
       draw(fullRoadName, 510, 575); 
    } else {
       // Ecriture générique si type non spécifié
       draw(fullRoadName, 200, 572);
    }

    // Agglomération
    check(460, 558); // Case "En agglomération"

    // Adresse précise du chantier
    draw(request.locationAddress, 100, 528);
    draw(request.locationCity, 200, 513); // Localité


    // 3. NATURE ET DATE DES TRAVAUX
    
    // Description (Multi-lignes)
    const description = request.workDescription || "";
    const maxLength = 110;
    if (description.length > maxLength) {
        draw(description.substring(0, maxLength), 25, 435);
        draw(description.substring(maxLength, maxLength * 2), 25, 420);
    } else {
        draw(description, 25, 435);
    }

    // Date début
    const dateStr = new Date(request.startDate).toLocaleDateString('fr-FR');
    // Format JJ MM AAAA approx sur la ligne
    draw(dateStr, 200, 360);

    // Durée
    draw(request.durationDays.toString(), 520, 360);


    // 4. RÉGLEMENTATION SOUHAITÉE

    // Durée réglementation (souvent identique à durée travaux)
    draw(request.durationDays.toString(), 270, 325);
    // Date début réglementation
    draw(dateStr, 480, 325);

    // Cocher les cases selon la demande
    
    // Restriction sur section courante / bretelles
    if (request.trafficType === 'section_courante') check(165, 312);
    if (request.trafficType === 'bretelle') check(280, 312);

    // Sens de circulation / Régime
    switch (request.trafficRegulation) {
        case 'alternat':
            // "Circulation alternée" -> "Par feux" ou "Manuel" (On coche feux par défaut ou selon info)
            check(235, 252); // Case Alternat par feux
            break;
        case 'route_barree':
            check(378, 268); // Case "Fermeture à la circulation"
            break;
        case 'restriction_chaussee':
            check(425, 297); // Case "Empiètement sur chaussée" (approx en bas)
            break;
        case 'stationnement_interdit':
            // Géré page 2 habituellement, mais parfois noté ici
            break;
        default:
            break;
    }

    // Basculement
    if (request.trafficDirection === 'bidirectionnel' && request.trafficRegulation === 'restriction_chaussee') {
        // Logique spécifique si besoin
    }


    // --- PAGE 2 : Signalisation & Signature ---
    
    if (pages.length > 1) {
        const page2 = pages[1];
        
        // Helper pour page 2
        const drawP2 = (text: string, x: number, y: number) => page2.drawText(text, { x, y, size: 10, font: helveticaFont });
        const checkP2 = (x: number, y: number) => page2.drawText('X', { x, y, size: 14, font: helveticaBold });

        // Interdictions (Haut de page)
        if (request.trafficRegulation === 'stationnement_interdit') {
            checkP2(260, 762); // Stationner
        }
        if (request.trafficRegulation === 'route_barree') {
            checkP2(110, 762); // Circuler
        }

        // Vitesse
        if (request.trafficRegulation === 'vitesse_limitee') {
            drawP2("30", 110, 715);
        }

        // Section "La pose... effectuée par"
        // On coche "Une entreprise spécialisée" (souvent le demandeur lui-même)
        checkP2(245, 582); // Case "Une entreprise spécialité" (ou Le demandeur à gauche)
        
        // Remplissage infos entreprise (Répétition)
        drawP2(profile.companyName, 100, 552); // Dénomination
        drawP2(profile.contactName, 380, 567); // Nom contact
        drawP2(profile.address, 100, 537); // Adresse
        drawP2(profile.postalCode, 100, 522); // CP
        drawP2(profile.city, 180, 522); // Ville
        drawP2(profile.phone, 100, 507); // Tel

        // SIGNATURE (Bas de page)
        checkP2(212, 275); // Case "J'atteste..."
        
        drawP2(profile.city, 70, 255); // Fait à
        drawP2(new Date().toLocaleDateString('fr-FR'), 160, 255); // Le
        
        drawP2(profile.companyName, 70, 240); // Nom signataire
        drawP2("Gérant", 450, 240); // Qualité
    }

    // Sauvegarde et téléchargement
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CERFA_14024-01_${profile.companyName.replace(/\s+/g, '_')}_${request.locationCity}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Erreur PDF:", error);
    alert("Une erreur est survenue lors de la création du PDF.");
  }
};