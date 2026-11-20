import { PORTFOLIO_PDF_PATH, PROFILE } from '../../data/projects';
import { PdfCanvasViewer } from '../PdfCanvasViewer';

export function PortfolioPdfView() {
  return (
    <PdfCanvasViewer
      key={PORTFOLIO_PDF_PATH}
      pdfUrl={PORTFOLIO_PDF_PATH}
      downloadFilename="Sabarivasan_G_Portfolio.pdf"
      sectionLabel="08 · Portfolio Presentation PDF"
      heading={`${PROFILE.name} — Portfolio Document`}
      viewLabel="View Portfolio"
      downloadLabel="Download Portfolio"
      downloadedLabel="Portfolio Downloaded"
      loadingLabel="Loading portfolio pages..."
    />
  );
}
