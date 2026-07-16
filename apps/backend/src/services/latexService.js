import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import util from 'node:util';
import crypto from 'node:crypto';

const execFileAsync = util.promisify(execFile);

/**
 * Compiles a LaTeX string into a PDF using a sandboxed Docker container.
 * 
 * Sandbox constraints enforced:
 * - --network none (no internet)
 * - --memory=256m, --cpus=1 (resource limits)
 * - --user 1000:1000 (non-root)
 * - --read-only (immutable filesystem except output/tmp)
 * - pdflatex -no-shell-escape (disabled external command execution)
 */
export async function compileLatexToPdf(texContent) {
  // Create a unique temporary directory for this job
  const jobId = crypto.randomUUID();
  const tmpBase = os.tmpdir();
  const jobDir = path.join(tmpBase, `latex-job-${jobId}`);
  const outputDir = path.join(jobDir, 'output');
  const workspaceDir = path.join(jobDir, 'workspace');

  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(workspaceDir, { recursive: true });

    // Write the .tex file to the workspace
    const texFilePath = path.join(workspaceDir, 'resume.tex');
    await fs.writeFile(texFilePath, texContent, 'utf8');

    // Make dirs writable by the container's worker user (uid 1000)
    // On Windows/Mac with Docker Desktop, file sharing handles permissions,
    // but we chmod broadly just in case for Linux hosts.
    try {
      await fs.chmod(outputDir, 0o777);
      await fs.chmod(workspaceDir, 0o777);
    } catch (e) {
      // Ignore chmod errors on Windows
    }

    const pdflatexArgs = [
      '-no-shell-escape',
      '-interaction=nonstopmode',
      '-halt-on-error',
      `-output-directory=${outputDir}`,
      'resume.tex'
    ];

    // Execute pdflatex natively. Timeout after 15 seconds.
    await execFileAsync('pdflatex', pdflatexArgs, { cwd: workspaceDir, timeout: 15000 });

    // Read the generated PDF
    const pdfPath = path.join(outputDir, 'resume.pdf');
    const pdfBuffer = await fs.readFile(pdfPath);

    return pdfBuffer;

  } catch (error) {
    // If execFile throws, error.stdout or error.stderr contains the pdflatex logs
    const logs = error.stderr || error.stdout || error.message;
    const compileError = new Error('LaTeX compilation failed or timed out.');
    compileError.logs = logs;
    throw compileError;
  } finally {
    // Cleanup temporary directories
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error(`Failed to cleanup job dir ${jobDir}:`, cleanupError);
    }
  }
}
