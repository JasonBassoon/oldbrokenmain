export default function NmapPortScanCaseStudy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nmap Port Scan Case Study
          </h1>
          <p className="text-lg text-gray-600">
            A comprehensive analysis of network reconnaissance using Nmap
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              This case study documents a practical network reconnaissance exercise using Nmap,
              one of the most powerful and widely-used network scanning tools in cybersecurity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Objectives</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Understand network topology and active hosts</li>
              <li>Identify open ports and running services</li>
              <li>Analyze service versions and potential vulnerabilities</li>
              <li>Document findings for security assessment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Methodology</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The scan was conducted in a controlled lab environment following ethical guidelines
              and proper authorization protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tools Used</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Nmap (Network Mapper)</li>
              <li>Kali Linux</li>
              <li>Wireshark for packet analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Findings</h2>
            <p className="text-gray-700 leading-relaxed">
              Detailed findings will be documented here as the case study progresses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conclusions</h2>
            <p className="text-gray-700 leading-relaxed">
              Lessons learned and security recommendations will be summarized here.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
