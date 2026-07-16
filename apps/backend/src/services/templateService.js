import Handlebars from 'handlebars';
import { escapeLatex } from '../utils/latexEscape.js';

// Create a custom Handlebars environment
const hbs = Handlebars.create();

// Override the default escape expression to use our LaTeX escaper
// This ensures that all {{ variable }} injections are LaTeX-safe, not HTML-safe.
hbs.Utils.escapeExpression = escapeLatex;

// Helper to check if a list is not empty
hbs.registerHelper('hasItems', function (array, options) {
  if (array && array.length > 0) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Helper for joining strings (like skills)
hbs.registerHelper('join', function (array, sep) {
  if (!array || !array.length) return '';
  return array.join(typeof sep === 'string' ? sep : ', ');
});

export function injectDataIntoLatex(texTemplate, verifiedResumeJson) {
  try {
    const template = hbs.compile(texTemplate, { strict: true });
    return template(verifiedResumeJson);
  } catch (err) {
    const compileError = new Error('Template injection failed: ' + err.message);
    compileError.status = 400;
    compileError.publicMessage = 'Template syntax error. Ensure variables match the profile schema.';
    throw compileError;
  }
}
