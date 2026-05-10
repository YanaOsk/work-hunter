import NavBarWrapper from "@/components/NavBarWrapper";
import SiteFooter from "@/components/SiteFooter";
import CvExamplesContent from "@/components/cv-builder/CvExamplesContent";

export default function CvExamplesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <NavBarWrapper />
      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <CvExamplesContent />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
