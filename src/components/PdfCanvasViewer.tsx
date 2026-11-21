import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  CheckVerifiedIcon,
  ChevronNextIcon,
  ChevronPrevIcon,
  DownloadTrayIcon,
  ExternalPortalIcon,
  SpinnerOrbitIcon,
  ZoomInLensIcon,
  ZoomOutLensIcon,
} from './NextGenIcons';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfCanvasViewerProps {
  pdfUrl: string;
  downloadFilename: string;
  sectionLabel: string;
  heading: string;
  viewLabel: string;
  downloadLabel: string;
  downloadedLabel: string;
  loadingLabel: string;
  singlePageOnly?: boolean;
}

export function PdfCanvasViewer({
  pdfUrl,
  downloadFilename,
  sectionLabel,
  heading,
  viewLabel,
  downloadLabel,
  downloadedLabel,
  loadingLabel,
  singlePageOnly = false,
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const downloadTimerRef = useRef<number>(0);
  const activeRenderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());

  const handleDownloadFeedback = () => {
    setDownloaded(true);
    window.clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = window.setTimeout(() => setDownloaded(false), 2400);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(downloadTimerRef.current);
    };
  }, []);

  // Load PDF document whenever pdfUrl changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMsg('');
    setNumPages(0);
    setCurrentPage(1);
    setZoomMultiplier(1);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    loadingTask.promise
      .then((doc) => {
        if (cancelled) {
          doc.cleanup();
          return;
        }
        pdfDocRef.current = doc;
        setNumPages(singlePageOnly ? Math.min(1, doc.numPages) : doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMsg(
            `Unable to render the PDF preview inline. Use ${downloadLabel} or ${viewLabel} above.`
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      void Promise.resolve(loadingTask.destroy()).catch(() => {});
      if (pdfDocRef.current) {
        void Promise.resolve(pdfDocRef.current.cleanup()).catch(() => {});
        pdfDocRef.current = null;
      }
    };
  }, [pdfUrl, singlePageOnly, downloadLabel, viewLabel]);

  // Render active page to canvas at HiDPI without concurrent canvas mutation races
  useEffect(() => {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container || numPages === 0) return;

    let cancelled = false;
    let lastWidth = container.clientWidth;

    const runSerializedRender = () => {
      const inFlight = activeRenderTaskRef.current;
      if (inFlight) {
        inFlight.cancel();
      }

      renderQueueRef.current = renderQueueRef.current
        .catch(() => {})
        .then(async () => {
          if (cancelled) return;
          setRenderingPage(true);

          const priorTask = activeRenderTaskRef.current;
          if (priorTask) {
            priorTask.cancel();
            try {
              await priorTask.promise;
            } catch {
              // Expected cancellation
            }
            activeRenderTaskRef.current = null;
          }

          if (cancelled) return;

          try {
            const targetPage = singlePageOnly ? 1 : currentPage;
            const page = await doc.getPage(targetPage);
            if (cancelled) return;

            const baseViewport = page.getViewport({ scale: 1 });
            const horizontalPadding = container.clientWidth < 640 ? 24 : 48;
            const availableWidth = Math.max(container.clientWidth - horizontalPadding, 200);
            const fitScale = Math.min(availableWidth / baseViewport.width, 2.2);
            const targetScale = fitScale * zoomMultiplier;
            const viewport = page.getViewport({ scale: targetScale });

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cssWidth = Math.floor(viewport.width);
            const cssHeight = Math.floor(viewport.height);

            canvas.width = Math.floor(cssWidth * dpr);
            canvas.height = Math.floor(cssHeight * dpr);
            canvas.style.width = `${cssWidth}px`;
            canvas.style.height = `${cssHeight}px`;

            const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

            const task = page.render({
              canvas,
              viewport,
              transform,
            });
            activeRenderTaskRef.current = task;
            await task.promise;
          } catch (err) {
            if (
              err &&
              typeof err === 'object' &&
              'name' in err &&
              err.name === 'RenderingCancelledException'
            ) {
              return;
            }
          } finally {
            activeRenderTaskRef.current = null;
            if (!cancelled) {
              setRenderingPage(false);
            }
          }
        });
    };

    runSerializedRender();

    let resizeRafId = 0;

    const handleResize = () => {
      if (cancelled) return;
      const nextWidth = container.clientWidth;
      if (Math.abs(nextWidth - lastWidth) > 4) {
        lastWidth = nextWidth;
        runSerializedRender();
      }
    };

    const scheduleResize = () => {
      if (cancelled) return;
      if (resizeRafId) {
        window.cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = 0;
        handleResize();
      });
    };

    window.addEventListener('resize', scheduleResize);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleResize();
          })
        : null;
    ro?.observe(container);

    return () => {
      cancelled = true;
      if (resizeRafId) {
        window.cancelAnimationFrame(resizeRafId);
      }
      window.removeEventListener('resize', scheduleResize);
      ro?.disconnect();
      if (activeRenderTaskRef.current) {
        activeRenderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl, currentPage, numPages, zoomMultiplier, singlePageOnly]);

  // Keyboard arrow navigation for multi-page documents
  useEffect(() => {
    if (singlePageOnly || numPages <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentPage((p) => (p < numPages ? p + 1 : 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage((p) => (p > 1 ? p - 1 : numPages));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [numPages, singlePageOnly]);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-kalam text-xs text-[#F05BEA] tabular-nums">
            {sectionLabel}
          </p>
          <h1 className="mt-2 font-road-rage text-4xl font-normal tracking-wide text-[#FF0000] sm:text-5xl">
            {heading}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors duration-200 hover:border-[#F05BEA]/65 hover:bg-[#F05BEA]/15 whitespace-nowrap shrink-0"
          >
            <ExternalPortalIcon className="h-3.5 w-3.5 text-[#F05BEA]" />
            <span>{viewLabel}</span>
          </a>

          <a
            href={pdfUrl}
            download={downloadFilename}
            onClick={handleDownloadFeedback}
            className={`touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 ${
              downloaded
                ? 'bg-[#F05BEA] text-[#071B1B] shadow-[0_0_20px_-3px_rgba(240,91,234,0.6)]'
                : 'bg-[#C8FF27] text-[#071B1B] shadow-[0_0_20px_-4px_rgba(200,255,39,0.55)] hover:bg-[#d5ff57] hover:shadow-[0_0_24px_-2px_rgba(200,255,39,0.75)]'
            }`}
          >
            {downloaded ? (
              <>
                <CheckVerifiedIcon className="h-3.5 w-3.5" />
                <span>{downloadedLabel}</span>
              </>
            ) : (
              <>
                <DownloadTrayIcon className="h-3.5 w-3.5" />
                <span>{downloadLabel}</span>
              </>
            )}
          </a>
        </div>
      </div>

      {/* Interactive PDF Canvas Viewer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="glass-surface-strong glass-accent-pink mt-8 overflow-hidden rounded-2xl"
      >
        {/* Top Viewer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#071B1B]/75 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {!singlePageOnly && (
              <button
                type="button"
                disabled={numPages <= 1}
                onClick={() =>
                  setCurrentPage((p) => (p > 1 ? p - 1 : numPages))
                }
                aria-label="Previous page"
                className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/15 disabled:opacity-40 cursor-pointer"
              >
                <ChevronPrevIcon className="h-4 w-4" />
              </button>
            )}

            <span className="px-2 font-kalam text-xs text-[#A0B2B2] tabular-nums">
              {numPages > 0
                ? singlePageOnly
                  ? 'Page 01 / 01'
                  : `Page ${String(currentPage).padStart(2, '0')} / ${String(
                      numPages
                    ).padStart(2, '0')}`
                : 'Loading...'}
            </span>

            {!singlePageOnly && (
              <button
                type="button"
                disabled={numPages <= 1}
                onClick={() =>
                  setCurrentPage((p) => (p < numPages ? p + 1 : 1))
                }
                aria-label="Next page"
                className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/15 disabled:opacity-40 cursor-pointer"
              >
                <ChevronNextIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || Boolean(errorMsg) || zoomMultiplier <= 0.6}
              onClick={() =>
                setZoomMultiplier((z) =>
                  Math.max(0.6, Number((z - 0.15).toFixed(2)))
                )
              }
              aria-label="Zoom out"
              className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/15 disabled:opacity-40 cursor-pointer"
            >
              <ZoomOutLensIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={loading || Boolean(errorMsg)}
              onClick={() => setZoomMultiplier(1)}
              aria-label="Reset zoom to 100%"
              className="touch-press h-11 sm:h-9 rounded-lg border border-white/15 bg-white/[0.04] px-3 font-kalam text-xs text-[#C8FF27] tabular-nums hover:border-[#C8FF27]/60 hover:bg-[#C8FF27]/12 disabled:opacity-40 cursor-pointer"
            >
              {Math.round(zoomMultiplier * 100)}%
            </button>
            <button
              type="button"
              disabled={loading || Boolean(errorMsg) || zoomMultiplier >= 1.8}
              onClick={() =>
                setZoomMultiplier((z) =>
                  Math.min(1.8, Number((z + 0.15).toFixed(2)))
                )
              }
              aria-label="Zoom in"
              className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#FFFFFF] hover:border-[#F05BEA]/60 hover:bg-[#F05BEA]/15 disabled:opacity-40 cursor-pointer"
            >
              <ZoomInLensIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas Viewport */}
        <div
          ref={containerRef}
          className="relative flex min-h-[420px] w-full touch-pan-x touch-pan-y overflow-auto bg-[#051414]/65 p-4 sm:p-6"
        >
          {loading ? (
            <div className="m-auto flex flex-col items-center gap-3 py-16 text-[#A0B2B2]">
              <SpinnerOrbitIcon className="h-6 w-6 animate-spin text-[#F05BEA]" />
              <span className="text-xs font-medium">{loadingLabel}</span>
            </div>
          ) : errorMsg ? (
            <div className="m-auto max-w-md py-16 text-center">
              <p className="text-sm text-[#A0B2B2]">{errorMsg}</p>
              <a
                href={pdfUrl}
                download={downloadFilename}
                onClick={handleDownloadFeedback}
                className="touch-press mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#C8FF27] px-4 py-2 text-xs font-bold text-[#071B1B] hover:bg-[#d5ff57]"
              >
                <DownloadTrayIcon className="h-3.5 w-3.5" />
                <span>{downloadLabel}</span>
              </a>
            </div>
          ) : (
            <div className="relative m-auto">
              <canvas
                ref={canvasRef}
                className="block rounded-lg border border-white/10 shadow-2xl"
              />
              {renderingPage && (
                <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-[#071B1B]/80 p-1.5 text-[#F05BEA] backdrop-blur-xs">
                  <SpinnerOrbitIcon className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Jump Strip for Multi-Page PDFs */}
        {!singlePageOnly && numPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/10 bg-[#071B1B]/75 px-4 py-3">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`touch-press h-10 min-w-[40px] sm:h-8 sm:min-w-[32px] rounded-md px-2 font-kalam text-xs tabular-nums cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#C8FF27] font-bold text-[#071B1B] shadow-[0_0_12px_-2px_rgba(200,255,39,0.55)]'
                      : 'bg-white/[0.04] text-[#A0B2B2] hover:bg-[#F05BEA]/15 hover:text-[#FFFFFF]'
                  }`}
                >
                  {String(pageNum).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}
