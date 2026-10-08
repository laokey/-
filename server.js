import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const uploadDir = path.join(rootDir, 'uploads');
const dataDir = path.join(rootDir, 'data');
const contentFile = path.join(dataDir, 'content.json');
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function ensureStorage() {
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(contentFile);
  } catch {
    await fs.writeFile(contentFile, '{}\n', 'utf8');
  }
}

async function readContent() {
  try {
    const raw = await fs.readFile(contentFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeContent(content) {
  await fs.writeFile(contentFile, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}

function createUploadStorage() {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const safeBase = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40);
      const uniqueName = `${safeBase || 'image'}_${Date.now()}${ext}`;
      cb(null, uniqueName);
    },
  });
}

async function startServer() {
  await ensureStorage();

  const app = express();
  const upload = multer({ storage: createUploadStorage() });

  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(uploadDir));

  app.get('/api/content', async (_req, res) => {
    const content = await readContent();
    res.json(content);
  });

  app.post('/api/content', async (req, res, next) => {
    try {
      await writeContent(req.body ?? {});
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/upload-image', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    res.json({
      url: `/uploads/${req.file.filename}`,
    });
  });

  if (isProduction) {
    const distDir = path.join(rootDir, 'dist');
    app.use(express.static(distDir));
    app.use('*', async (_req, res, next) => {
      try {
        const html = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
        res.status(200).setHeader('Content-Type', 'text/html').end(html);
      } catch (error) {
        next(error);
      }
    });
  } else {
    const vite = await createViteServer({
      root: rootDir,
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const indexHtml = await fs.readFile(path.join(rootDir, 'index.html'), 'utf8');
        const html = await vite.transformIndexHtml(req.originalUrl, indexHtml);
        res.status(200).setHeader('Content-Type', 'text/html').end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        next(error);
      }
    });
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
