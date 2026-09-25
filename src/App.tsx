import {
  Suspense,
  Component,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  RotateCcw,
  X,
  Move,
  Maximize,
  Minimize,
  Moon,
  Pause,
  Play,
  Map,
} from "lucide-react";
import { chapters, numerals } from "./chapters";
const World = lazy(() => import("./World"));
class WorldLoaderBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? (
      <div className="webgl-fallback" role="status">
        月色暂未抵达
        <br />
        <small>景观加载失败，请刷新重试。你仍可打开全词阅读。</small>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [selected, setSelected] = useState(0),
    [traveling, setTraveling] = useState(false),
    [settled, setSettled] = useState(false),
    [overviewMode, setOverviewMode] = useState(false),
    [reset, setReset] = useState(0),
    [ready, setReady] = useState(false),
    [full, setFull] = useState(false),
    [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [help, setHelp] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    nav = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const go = useCallback((i: number) => {
    setSettled(false);
    setSelected(i);
    setOverviewMode(false);
    setReset((v) => v + 1);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    nav.current?.querySelector('[aria-current="step"]')?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [selected, reduced]);
  useEffect(() => {
    const change = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setHelp(true);
    }
  };
  const chapter = chapters[selected];
  return (
    <main className={`app ${selected === 6 && settled && !overviewMode ? "finale-rest" : ""}`}>
      <WorldLoaderBoundary onError={onReady}>
        <Suspense
          fallback={
            <div className="loading">
              正在铺开月色<span>ENTERING THE MOONLIGHT</span>
            </div>
          }
        >
          <World
            chapter={selected}
            reset={reset}
            overviewMode={overviewMode}
            reduced={reduced}
            paused={paused}
            onTravel={setTraveling}
            onSettle={setSettled}
            onReady={onReady}
          />
        </Suspense>
      </WorldLoaderBoundary>
      {!ready && (
        <div className="loading loading-secondary">
          月色将至 <span>正在构筑山水</span>
        </div>
      )}
      <div className="vignette" />
      <header className="header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
          aria-label="月境，回到第一幕"
        >
          <span className="brand-icon">
            <Moon size={23} strokeWidth={1} />
          </span>
          <span>
            月 境<small>MOON VERSE</small>
          </span>
        </a>
        <div className="edition">
          一片山河 · 七处诗境<span>ONE WORLD, SEVEN VIEWS</span>
        </div>
        <button
          className="poem-button"
          onClick={() => dialog.current?.showModal()}
        >
          <BookOpen size={16} strokeWidth={1.3} />
          <span>读全词</span>
        </button>
      </header>
      <section className="story" aria-live="polite" aria-atomic="true">
        <div className="eyebrow">
          <span className="tiny-line" /> 丙辰中秋 · 宋词漫游
        </div>
        <div className="work-title">
          水调歌头<span>苏轼 · 宋</span>
        </div>
        <div className="verse-content" key={selected}>
          <div className="chapter-kicker">
            第{numerals[selected]}幕 <span>/</span> {chapter.title}
          </div>
          <h1>
            {chapter.verse.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <div className="verse-rule">
            <i />
            <span>{chapter.subtitle}</span>
          </div>
          <p className="note">{chapter.note}</p>
        </div>
        <button className="continue" onClick={() => go((selected + 1) % 7)}>
          <span>{selected === 6 ? "再入月境" : "循月而行"}</span>
          <ArrowRight size={18} strokeWidth={1.2} />
        </button>
      </section>
      <div className="scene-caption">
        <span className="caption-line" />
        <span>{overviewMode ? "山河全境" : chapter.title}</span>
        <small>月境 {String(selected + 1).padStart(2, "0")} / 07</small>
      </div>
      <div className="tools" aria-label="观景工具">
        <button
          onClick={() => setOverviewMode((v) => !v)}
          aria-label={overviewMode ? "返回诗句视角" : "俯瞰全境"}
          title={overviewMode ? "返回诗句视角" : "俯瞰全境"}
          aria-pressed={overviewMode}
        >
          <Map size={17} strokeWidth={1.3} />
        </button>
        <button
          onClick={() => setHelp(!help)}
          aria-label="观景操作说明"
          aria-expanded={help}
        >
          <Move size={17} strokeWidth={1.3} />
        </button>
        <button
          onClick={() => go(selected)}
          aria-label="恢复最佳视角"
          title="恢复最佳视角"
        >
          <RotateCcw size={16} strokeWidth={1.3} />
        </button>
        <button
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "继续景物动态" : "暂停景物动态"}
          title={paused ? "继续景物动态" : "暂停景物动态"}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        {document.fullscreenEnabled && (
          <button
            onClick={toggleFull}
            aria-label={full ? "退出全屏" : "全屏观景"}
            title="全屏观景"
          >
            {full ? (
              <Minimize size={16} />
            ) : (
              <Maximize size={16} strokeWidth={1.3} />
            )}
          </button>
        )}
      </div>
      {help && (
        <div className="help">
          <button onClick={() => setHelp(false)} aria-label="关闭说明">
            <X size={14} />
          </button>
          拖动 · 环顾月境
          <br />
          滚轮 · 远近观景
          <br />
          点击诗句 · 移步换景
          <br />
          俯瞰全境 · 看见山河相连
          <br />
          镜头行进时拖动 · 停下观景
        </div>
      )}
      <footer className="bottom">
        <div className="nav-heading">
          <span>
            <i /> 以诗为径，循月而行
          </span>
          <span className="nav-hint" role="status">
            {traveling ? `循月而行 · 正前往${overviewMode ? "山河全境" : chapter.title}` : "点击诗句，沿同一片山河漫游"}
          </span>
          <div className="arrows">
            <button
              disabled={selected === 0}
              onClick={() => go(selected - 1)}
              aria-label="上一幕"
            >
              <ArrowLeft size={17} />
            </button>
            <span>
              {String(selected + 1).padStart(2, "0")} <em>/ 07</em>
            </span>
            <button
              disabled={selected === 6}
              onClick={() => go(selected + 1)}
              aria-label="下一幕"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <nav aria-label="诗句场景导航">
          <div className="chapter-nav" ref={nav}>
            {chapters.map((c, i) => (
              <button
                key={c.title}
                className={`chapter ${selected === i ? "active" : ""}`}
                aria-current={selected === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                <span className="chapter-top">
                  <span className="chapter-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="chapter-dot" />
                </span>
                <span className="chapter-title">{c.title}</span>
                <span className="chapter-line">
                  {c.verse.split("\n")[0].replace(/[，？。]/g, "")}
                </span>
              </button>
            ))}
          </div>
        </nav>
        <div className="colophon">
          <span>千年前的月光，此刻落在你身上。</span>
          <span>苏轼《水调歌头》 · 公元 1076 年</span>
          <span>
            以体素，重写诗意 <span className="mini-moon">◒</span>
          </span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="poem-dialog"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="poem-sheet">
          <button
            className="dialog-close"
            onClick={() => dialog.current?.close()}
            aria-label="关闭全词"
          >
            <X size={21} strokeWidth={1.2} />
          </button>
          <div className="eyebrow">月 境 / 原 词</div>
          <h2>水调歌头</h2>
          <div className="poem-author">明月几时有 · 苏轼</div>
          <p className="preface">
            丙辰中秋，欢饮达旦，大醉，作此篇，兼怀子由。
          </p>
          <div className="full-poem">
            {chapters.map((c, i) => (
              <button
                key={c.title}
                onClick={() => {
                  go(i);
                  dialog.current?.close();
                }}
                className={selected === i ? "current" : ""}
              >
                <small>
                  {String(i + 1).padStart(2, "0")} · {c.title}
                </small>
                {c.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </button>
            ))}
          </div>
          <p className="poem-foot">轻触诗句，走入它的月色。</p>
        </div>
      </dialog>
    </main>
  );
}
