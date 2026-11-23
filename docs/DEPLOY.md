# Деплой MATRIXX OS

Сборка полностью статическая и переносимая: `base: './'`, все шрифты и ассеты
лежат внутри `dist/`.

## Вариант 1: GitHub Pages (бесплатно)

1. Создайте публичный репозиторий, например `matrixx-os`:

   ```bash
   gh repo create matrixx-os --public --source=. --remote=origin --push
   ```

   Если `gh` не настроен:

   ```bash
   git remote add origin https://github.com/<user>/matrixx-os.git
   git push -u origin main
   ```

2. Соберите и опубликуйте ветку `gh-pages`:

   ```bash
   npm run build
   npm run deploy
   ```

3. В GitHub откройте **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**

4. Через 1–2 минуты сайт будет доступен:

   ```
   https://<user>.github.io/matrixx-os/
   ```

   Благодаря относительному `base` приложение работает и из подпапки, и с
   кастомного домена без пересборки.

### Если страница пустая

- Проверьте, что в `dist/index.html` пути начинаются с `./assets/`, а не `/assets/`.
- Проверьте, что ветка `gh-pages` содержит `index.html` и `.nojekyll`.
- `npm run deploy` публикует содержимое `dist/` в корень ветки `gh-pages`
  (флаг `--nojekyll` включён в скрипт, поэтому `.nojekyll` тоже попадает в ветку).
- В настройках Pages должен быть выбран именно `gh-pages`, а не `main`.

## Вариант 2: Cloudflare Pages (резерв для РФ)

1. Запушьте репозиторий на GitHub.
2. В Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Параметры сборки:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 20 или новее
4. Deploy.

Cloudflare Pages обычно доступнее из РФ, чем GitHub Pages, и тоже бесплатен
для статических проектов. Домен вида `matrixx-os.pages.dev` можно переслать
друзьям.

## Вариант 3: любой статический хостинг

```bash
npm run build
```

Загрузите содержимое `dist/` на:

- nginx / Apache;
- Vercel / Netlify;
- GitVerse Pages;
- Yandex Cloud Object Storage (static website hosting).

Никаких серверных переменных и секретов не требуется.

## Публикация через GitHub Actions (опционально)

Токен GitHub CLI без scope `workflow` не сможет запушить YAML-файл workflow.
Если нужен автодеплой при push в `main`:

1. Выдайте себе scope:

   ```bash
   gh auth refresh -s workflow
   ```

2. Добавьте `.github/workflows/deploy.yml` с шагами:
   `npm ci` → `npm run build` → `actions/upload-pages-artifact` (`dist`) →
   `actions/deploy-pages`.
3. В **Settings → Pages** выберите Source: **GitHub Actions**.

Для ручной публикации достаточно `npm run deploy`.

## Проверка после деплоя

```bash
curl -I https://<user>.github.io/matrixx-os/
```

Ожидается `HTTP/2 200`, затем откройте сайт и проверьте:

- BIOS и вход отображаются;
- терминал открывается и выполняет `help`;
- темы переключаются;
- в консоли браузера нет ошибок;
- на мобильном 390×844 нет горизонтального скролла.
