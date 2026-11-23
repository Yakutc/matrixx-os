import { useState } from 'react'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import { longDate, useClock } from './useClock'

export function LoginScreen() {
  const { login } = useOS()
  const now = useClock()
  const [password, setPassword] = useState('')

  return (
    <div className="login">
      <div className="login__bg" aria-hidden="true" />
      <div className="login__left">
        <div className="login__top">
          <span>MATRIXX OS 0.9.7 / RECOVERY</span>
          <span>{longDate(now)}</span>
        </div>

        <div className="login__card">
          <div className="login__kicker">УРОВЕНЬ ДОСТУПА / ГОСТЬ</div>
          <h1 className="login__title">ВХОД В СИСТЕМУ</h1>
          <div className="login__status">
            <span className="led" />
            ГОСТЕВОЙ СЕАНС · ТЕРМИНАЛ 04
          </div>

          <form
            className="login__form"
            onSubmit={(event) => {
              event.preventDefault()
              login()
            }}
          >
            <div className="login__row">
              <label htmlFor="login-operator">Оператор</label>
              <input
                id="login-operator"
                className="field"
                value="оператор"
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="login__row">
              <label htmlFor="login-password">Пароль</label>
              <input
                id="login-password"
                className="field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn--solid login__submit">
              <Icon name="power" size={16} />
              ВОЙТИ В СИСТЕМУ
            </button>
          </form>

          <div className="login__hint">
            <span>ПАРОЛЬ НЕ ТРЕБУЕТСЯ</span>
            <span>
              <span className="kbd">ENTER</span> — ПОДТВЕРДИТЬ
            </span>
          </div>

          <div className="login__foot">
            <span>СБОРКА 0.9.7</span>
            <span>СЕКТОР 4 · КОНТУР РЕЗЕРВНЫЙ</span>
          </div>
        </div>

        <div className="login__top">
          <span>НИИ-9 · 1997—2026</span>
          <span>НЕ ОТКЛЮЧАТЬ ПИТАНИЕ</span>
        </div>
      </div>

      <div className="login__right">
        <div className="login__huge">
          <span>ДОСТУП</span>
          <span>К СИСТЕМЕ</span>
        </div>
        <div className="login__serial">
          Машина помнит.
          <br />
          Оператор — нет.
        </div>
      </div>
    </div>
  )
}
