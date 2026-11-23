import { useState } from 'react'
import { useOS } from '../../os/OSProvider'
import type { AppProps } from '../../os/types'

export default function AboutApp(_props: AppProps) {
  const { settings, setSettings, notify } = useOS()
  const [clicks, setClicks] = useState(0)

  const touchLogo = () => {
    const next = clicks + 1
    if (next >= 5) {
      const theme = settings.theme === 'bone' ? 'phosphor' : 'bone'
      setSettings({ theme })
      notify(`ТЕМА ПЕРЕКЛЮЧЕНА: ${theme.toUpperCase()}`, 'ok')
      setClicks(0)
      return
    }
    setClicks(next)
  }

  return (
    <div className="about">
      <div className="about__hero">
        <div className="about__stamp">НИИ-9 · СЕКТОР 4 · 1997—2026</div>
        <button
          type="button"
          className="about__logo"
          onClick={touchLogo}
          aria-label="Логотип MATRIXX"
          title="Не нажимайте пять раз"
        >
          <span>MATRIXX</span>
          <small>OS 0.9.7 / RECOVERY BUILD</small>
        </button>
        <div className="about__serial">
          <span>СЕРИЯ 04</span>
          <span>СЛОТ 09</span>
          <span className="danger">ДОСТУП: ГОСТЬ</span>
        </div>
      </div>

      <div className="about__body">
        <section className="about__section about__section--manifest">
          <div className="section-label">МАНИФЕСТ</div>
          <p>
            Эта система не предназначена для выхода в сеть. Она предназначена для того, чтобы сеть
            вышла к вам.
          </p>
          <p>
            MATRIXX восстановлена из резервного образа терминала 04. Девять слотов памяти, один
            рабочий контур и сигнал на частоте 47.2 Гц. Не отвечайте на сигнал.
          </p>
          <div className="about__warning">НЕ ОТКЛЮЧАТЬ ПИТАНИЕ · НЕ ОТКРЫВАТЬ .ПРОТОКОЛ</div>
        </section>

        <section className="about__section">
          <div className="section-label">УПРАВЛЕНИЕ</div>
          <div className="about__keys">
            <div><span><span className="kbd">CTRL</span> <span className="kbd">K</span></span><b>командная палитра</b></div>
            <div><span><span className="kbd">ALT</span> <span className="kbd">`</span></span><b>переключение окон</b></div>
            <div><span><span className="kbd">ESC</span></span><b>закрыть оверлей</b></div>
            <div><span><span className="kbd">↑↓←→</span></span><b>змей / терминал</b></div>
            <div><span><span className="kbd">↑↑↓↓←→←→BA</span></span><b>не нажимайте</b></div>
          </div>
        </section>

        <section className="about__section">
          <div className="section-label">СБОРКА</div>
          <div className="about__grid">
            <div><span>СИСТЕМА</span><b>matrixx 0.9.7</b></div>
            <div><span>ЯДРО</span><b>recovery-04</b></div>
            <div><span>ОБОЛОЧКА</span><b>msh 0.9</b></div>
            <div><span>ОКНА</span><b>wm-04</b></div>
            <div><span>СИГНАЛ</span><b>47.2 Гц</b></div>
            <div><span>ПАМЯТЬ</span><b>640 КБ</b></div>
          </div>
        </section>

        <section className="about__section about__section--credits">
          <div className="section-label">КОНТАКТ</div>
          <p className="about__muted">
            Восстановлено в 2026. Исходный код доступен операторам с допуском.
          </p>
          <a href="https://github.com/Yakutc/matrixx-os" target="_blank" rel="noopener noreferrer">
            github.com/Yakutc/matrixx-os →
          </a>
          <div className="about__footer">
            <span>СОБРАНО В НИИ-9</span>
            <span>ТЕРМИНАЛ 04 · СЕКТОР 4</span>
            <span>ВЕРСИЯ 0.9.7</span>
          </div>
        </section>
      </div>
    </div>
  )
}
