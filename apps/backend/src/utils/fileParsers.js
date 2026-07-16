import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromUpload(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  const err = new Error(`Unsupported file type: ${mimetype}`);
  err.status = 415;
  err.publicMessage = 'unsupported_file_type';
  throw err;
}
