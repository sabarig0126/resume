import { PROFILE, RESUME_PDF_PATH } from '../../data/projects';
import { PdfCanvasViewer } from '../PdfCanvasViewer';

export function ResumeView() {
  return (
    <PdfCanvasViewer
      key={RESUME_PDF_PATH}
      pdfUrl={RESUME_PDF_PATH}
      downloadFilename="Sabarivasan_G_Resume.pdf"
      sectionLabel="07 · Official Resume PDF"
      heading={`${PROFILE.name} — Resume`}
      viewLabel="View Resume"
      downloadLabel="Download Resume"
      downloadedLabel="Resume Downloaded"
      loadingLabel="Loading resume..."
      singlePageOnly
    />
  );
}
