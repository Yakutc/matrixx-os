import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppId,
  OpenOptions,
  OSApi,
  Phase,
  Settings,
  Toast,
  ToastTone,
  Rect,
  WindowState,
} from './types'
import { APP_META, createDefaultRect, isAppId } from './apps'
import { KEYS, clearSystemStorage, loadSettings, readJson, saveSettings, writeJson } from './storage'
import { playUiSound } from './sound'
import {
  clampRect,
  persistableWindows,
  sanitizeWindows,
  wmReducer,
  workspaceBounds,
  type WMState,
} from './wm'

const OSContext = createContext<OSApi | null>(null)

function restoredState(): WMState {
  const windows = sanitizeWindows(
    readJson<unknown>(KEYS.session, []),
    workspaceBounds(window.innerWidth, window.innerHeight),
    isAppId,
  )
  const z = windows.reduce((max, win) => Math.max(max, win.z), 0)
  const top = windows.filter((win) => !win.minimized).sort((a, b) => b.z - a.z)[0]
  return { windows, activeId: top?.id ?? null, z: z + 1, seq: z }
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings())
  const [state, dispatch] = useReducer(wmReducer, undefined, restoredState)
  const [phase, setPhase] = useState<Phase>(() => (loadSettings().skipBoot ? 'login' : 'boot'))
  const [toasts, setToasts] = useState<Toast[]>([])
  const seqRef = useRef(0)
  const toastRef = useRef(0)
  const autoOpened = useRef(false)

  const playSound = useCallback(
    (name: 'click' | 'open' | 'close' | 'error' | 'chime') => {
      if (settings.sound) playUiSound(name, settings.volume)
    },
    [settings.sound, settings.volume],
  )

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((current) => ({ ...current, ...patch }))
  }, [])

  const notify = useCallback((text: string, tone: ToastTone = 'info') => {
    const id = ++toastRef.current
    setToasts((current) => [...current.slice(-3), { id, text, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const openWindow = useCallback(
    (appId: AppId, options: OpenOptions = {}): string => {
      const meta = APP_META[appId]
      const singleton = options.singleton ?? meta.singleton
      const existing = singleton ? state.windows.find((win) => win.appId === appId) : undefined
      if (existing) {
        dispatch({
          type: 'open',
          singleton: true,
          window: {
            ...existing,
            title: options.title ?? existing.title,
            payload: options.payload ?? existing.payload,
          },
        })
        return existing.id
      }
      const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
      const base = createDefaultRect(appId, bounds, state.windows.length)
      const rect = clampRect({ ...base, ...options.rect }, bounds)
      const id = `w-${appId}-${++seqRef.current}-${Date.now().toString(36)}`
      const win: WindowState = {
        id,
        appId,
        title: options.title ?? meta.title,
        rect,
        z: 0,
        minimized: false,
        maximized: false,
        payload: options.payload,
      }
      dispatch({ type: 'open', window: win, singleton })
      playSound('open')
      return id
    },
    [playSound, state.windows],
  )

  const closeWindow = useCallback(
    (id: string) => {
      dispatch({ type: 'close', id })
      playSound('close')
    },
    [playSound],
  )

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: 'focus', id })
  }, [])

  const minimizeWindow = useCallback(
    (id: string) => {
      dispatch({ type: 'minimize', id })
      playSound('click')
    },
    [playSound],
  )

  const toggleMaximize = useCallback((id: string) => {
    dispatch({
      type: 'toggleMax',
      id,
      bounds: workspaceBounds(window.innerWidth, window.innerHeight),
    })
  }, [])

  const moveWindow = useCallback((id: string, rect: Rect) => {
    dispatch({
      type: 'move',
      id,
      rect: clampRect(rect, workspaceBounds(window.innerWidth, window.innerHeight)),
    })
  }, [])

  const bootDone = useCallback(() => setPhase('login'), [])

  const login = useCallback(() => {
    setPhase('desktop')
    playSound('chime')
    if (!autoOpened.current && state.windows.length === 0) {
      autoOpened.current = true
      const coarse = window.matchMedia('(pointer: coarse)').matches
      if (coarse) {
        notify('СИСТЕМА ЗАГРУЖЕНА. ВЫБЕРИТЕ МОДУЛЬ.', 'ok')
        return
      }
      const wide = window.innerWidth >= 1100
      openWindow(
        'terminal',
        wide
          ? {
              rect: {
                x: window.innerWidth - 820,
                y: window.innerHeight - 548,
                w: 780,
                h: 480,
              },
            }
          : undefined,
      )
      notify('СИСТЕМА ЗАГРУЖЕНА. ТЕРМИНАЛ 04 В СЕТИ.', 'ok')
    }
  }, [notify, openWindow, playSound, state.windows.length])

  const lock = useCallback(() => setPhase('lock'), [])
  const unlock = useCallback(() => {
    setPhase('desktop')
    playSound('click')
  }, [playSound])
  const reboot = useCallback(() => {
    setPhase(loadSettings().skipBoot ? 'login' : 'boot')
    playSound('close')
  }, [playSound])
  const shutdown = useCallback(() => {
    setPhase('off')
    playSound('close')
  }, [playSound])
  const powerOn = useCallback(() => {
    setPhase(loadSettings().skipBoot ? 'login' : 'boot')
    playSound('open')
  }, [playSound])

  const resetSystem = useCallback(() => {
    clearSystemStorage()
    window.location.reload()
  }, [])

  const triggerSignal = useCallback(() => {
    window.dispatchEvent(new CustomEvent('matrixx:signal'))
  }, [])

  useEffect(() => {
    saveSettings(settings)
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.wallpaper = settings.wallpaper
    root.dataset.crt = settings.crt ? 'on' : 'off'
    root.dataset.reduceMotion = settings.reduceMotion ? 'on' : 'off'
    const meta = document.querySelector('meta[name="theme-color"]')
    const colors: Record<Settings['theme'], string> = {
      phosphor: '#050806',
      amber: '#080604',
      bone: '#e8e2d2',
    }
    meta?.setAttribute('content', colors[settings.theme])
  }, [settings])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeJson(KEYS.session, persistableWindows(state.windows))
    }, 220)
    return () => window.clearTimeout(timer)
  }, [state.windows])

  useEffect(() => {
    const onResize = () => {
      dispatch({
        type: 'bounds',
        bounds: workspaceBounds(window.innerWidth, window.innerHeight),
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!settings.sound) return
    const onClick = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-silent="true"]')) return
      if (target.closest('button, [role="menuitem"], [role="option"], .icon-tile, .start-item')) {
        playUiSound('click', settings.volume)
      }
    }
    document.addEventListener('pointerdown', onClick)
    return () => document.removeEventListener('pointerdown', onClick)
  }, [settings.sound, settings.volume])

  const value = useMemo<OSApi>(
    () => ({
      settings,
      setSettings,
      resetSystem,
      windows: state.windows,
      activeId: state.activeId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
      moveWindow,
      phase,
      bootDone,
      login,
      lock,
      unlock,
      reboot,
      shutdown,
      powerOn,
      toasts,
      notify,
      dismissToast,
      playSound,
      triggerSignal,
    }),
    [
      settings,
      setSettings,
      resetSystem,
      state.windows,
      state.activeId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
      moveWindow,
      phase,
      bootDone,
      login,
      lock,
      unlock,
      reboot,
      shutdown,
      powerOn,
      toasts,
      notify,
      dismissToast,
      playSound,
      triggerSignal,
    ],
  )

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

export function useOS(): OSApi {
  const value = useContext(OSContext)
  if (!value) throw new Error('useOS must be used inside OSProvider')
  return value
}
