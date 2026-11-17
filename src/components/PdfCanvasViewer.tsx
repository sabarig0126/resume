import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

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

  const handleDownloadFeedback = () => {
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

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
        setNumPages(singlePageOnly ? 1 : doc.numPages);
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
      loadingTask.destroy();
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
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
    let activeTask: pdfjsLib.RenderTask | null = null;
    let renderChain: Promise<void> = Promise.resolve();
    let lastWidth = container.clientWidth;

    const runSerializedRender = () => {
      renderChain = renderChain.then(async () => {
        if (cancelled) return;
        setRenderingPage(true);

        if (activeTask) {
          activeTask.cancel();
          try {
            await activeTask.promise;
          } catch {
            // Expected cancellation
          }
          activeTask = null;
        }

        if (cancelled) return;

        try {
          const targetPage = singlePageOnly ? 1 : currentPage;
          const page = await doc.getPage(targetPage);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const availableWidth = Math.max(container.clientWidth - 48, 280);
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

          activeTask = page.render({
            canvas,
            viewport,
            transform,
          });
          await activeTask.promise;
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
          activeTask = null;
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
      if (activeTask) {
        activeTask.cancel();
      }
    };
  }, [pdfUrl, currentPage, numPages, zoomMultiplier, singlePageOnly]);

  // Keyboard arrow navigation for multi-page documents
  useEffect(() => {
    if (singlePageOnly || numPages <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
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
          <p className="font-mono text-xs text-amber-400 tabular-nums">
            {sectionLabel}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {heading}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-400/50 hover:bg-white/15 whitespace-nowrap shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{viewLabel}</span>
          </a>

          <a
            href={pdfUrl}
            download={downloadFilename}
            onClick={handleDownloadFeedback}
            className={`touch-press inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 ${
              downloaded
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-[#2563EB] hover:bg-blue-500'
            }`}
          >
            {downloaded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{downloadedLabel}</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
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
        className="glass-surface-strong mt-8 overflow-hidden rounded-2xl"
      >
        {/* Top Viewer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#070E22]/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {!singlePageOnly && (
              <button
                type="button"
                disabled={numPages <= 1}
                onClick={() =>
                  setCurrentPage((p) => (p > 1 ? p - 1 : numPages))
                }
                aria-label="Previous page"
                className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/15 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            <span className="px-2 font-mono text-xs text-slate-200 tabular-nums">
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
                className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/15 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setZoomMultiplier((z) =>
                  Math.max(0.6, Number((z - 0.15).toFixed(2)))
                )
              }
              aria-label="Zoom out"
              className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/15 cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomMultiplier(1)}
              className="touch-press h-11 sm:h-9 rounded-lg border border-white/15 bg-white/5 px-3 font-mono text-xs text-slate-200 tabular-nums hover:border-cyan-400/50 hover:bg-white/15 cursor-pointer"
            >
              {Math.round(zoomMultiplier * 100)}%
            </button>
            <button
              type="button"
              onClick={() =>
                setZoomMultiplier((z) =>
                  Math.min(1.8, Number((z + 0.15).toFixed(2)))
                )
              }
              aria-label="Zoom in"
              className="touch-press inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/15 cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas Viewport */}
        <div
          ref={containerRef}
          className="relative flex min-h-[420px] w-full touch-pan-x touch-pan-y overflow-auto bg-[#050A18]/90 p-4 sm:p-6"
        >
          {loading ? (
            <div className="m-auto flex flex-col items-center gap-3 py-16 text-slate-300">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="text-xs font-medium">{loadingLabel}</span>
            </div>
          ) : errorMsg ? (
            <div className="m-auto max-w-md py-16 text-center">
              <p className="text-sm text-slate-300">{errorMsg}</p>
              <a
                href={pdfUrl}
                download={downloadFilename}
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Download className="h-3.5 w-3.5" />
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
                <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/60 p-1.5 text-blue-300 backdrop-blur-xs">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Jump Strip for Multi-Page PDFs */}
        {!singlePageOnly && numPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/10 bg-[#070E22]/90 px-4 py-3">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`touch-press h-10 min-w-[40px] sm:h-8 sm:min-w-[32px] rounded-md px-2 font-mono text-xs tabular-nums cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] font-semibold text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/15 hover:text-white'
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
