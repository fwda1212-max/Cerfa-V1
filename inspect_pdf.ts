import { PDFDocument } from 'pdf-lib';
import { CERFA_TEMPLATE_BASE64 } from './services/cerfaTemplate';

async function inspect() {
  try {
    const pdfDoc = await PDFDocument.load(CERFA_TEMPLATE_BASE64);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log('--- FORM FIELDS ---');
    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      console.log(`${name} (${type})`);
    });
    console.log('--- END ---');
  } catch (e) {
    console.error(e);
  }
}

inspect();
