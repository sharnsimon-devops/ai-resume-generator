// Utility to escape LaTeX special characters
export function escapeLatex(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/\r\n/g, '\\newline ')
    .replace(/\n/g, '\\newline ');
}
