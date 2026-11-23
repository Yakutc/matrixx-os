# Deploying Matrixx Linux

The build is fully static and portable: `base: './'`, all fonts and assets are bundled
inside `dist/`, and no server-side configuration is required.

## Option 1: GitHub Pages (free)

1. Create a public repository (for example `matrixx-os`):

   ```bash
   gh repo create matrixx-os --public --source=. --remote=origin --push
   ```

   Without `gh`:

   ```bash
   git remote add origin https://github.com/<user>/matrixx-os.git
   git push -u origin main
   ```

2. Build and publish the `gh-pages` branch:

   ```bash
   npm run build
   npm run deploy
   ```

3. In GitHub open **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**

4. The site becomes available at:

   ```
   https://<user>.github.io/matrixx-os/
   ```

   The relative `base` makes the same build work from a subpath, a custom domain,
   or Cloudflare Pages.

### Troubleshooting

- If the page is blank, check that `dist/index.html` references `./assets/…`
  rather than `/assets/…`.
- Check that the `gh-pages` branch contains `index.html` and `.nojekyll`.
  The deploy script includes `--nojekyll`.
- Pages must point to `gh-pages`, not `main`.

## Option 2: Cloudflare Pages (good fallback)

1. Push the repository to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 20 or newer
4. Deploy.

Cloudflare Pages is usually reachable from networks where GitHub Pages is slow, and
is free for static projects. The domain looks like `matrixx-os.pages.dev`.

## Option 3: Any static host

```bash
npm run build
```

Upload the contents of `dist/` to nginx, Apache, Vercel, Netlify, GitVerse Pages, or
Yandex Cloud Object Storage. No environment variables or secrets are needed.

## Optional GitHub Actions deployment

The GitHub CLI token may lack the `workflow` scope. To deploy on every push to `main`:

1. Grant the scope:

   ```bash
   gh auth refresh -s workflow
   ```

2. Add `.github/workflows/deploy.yml` with:
   `npm ci` → `npm run build` → `actions/upload-pages-artifact` (`dist`) →
   `actions/deploy-pages`.
3. In **Settings → Pages** select Source: **GitHub Actions**.

For manual publishing, `npm run deploy` is enough.

## Post-deploy verification

```bash
curl -I https://<user>.github.io/matrixx-os/
```

Expect `HTTP/2 200`. Then open the site and check:

- GRUB and GDM are visible;
- Terminal opens and `help` works;
- Activities and the application grid open;
- themes switch in Settings;
- no console errors;
- on 390×844 there is no horizontal overflow.
