import React, { useState, useRef } from "react";
import { FileText, Upload, Download, Trash2, Share2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import SignaturePad from "react-signature-canvas";

interface DocType {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: "Draft" | "In Review" | "Signed";
  url?: string; // ✅ for static PDFs
}

const initialDocuments: DocType[] = [
  {
    id: 1,
    name: "Pitch Deck 2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "2024-02-15",
    shared: true,
    status: "Signed",
    url: "/pdfs/pitch-deck.pdf",
  },
  {
    id: 2,
    name: "Financial Projections.xlsx",
    type: "Spreadsheet",
    size: "1.8 MB",
    lastModified: "2024-02-10",
    shared: false,
    status: "In Review",
  },
  {
    id: 3,
    name: "Business Plan.docx",
    type: "Document",
    size: "3.2 MB",
    lastModified: "2024-02-05",
    shared: true,
    status: "Draft",
  },
  {
    id: 4,
    name: "Market Research.pdf",
    type: "PDF",
    size: "5.1 MB",
    lastModified: "2024-01-28",
    shared: false,
    status: "Draft",
    url: "/pdfs/market-research.pdf",
  },
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocType[]>(initialDocuments);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File }>({});
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const sigPadRef = useRef<SignaturePad>(null);

  // Upload
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }
  ) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];

      const newDoc: DocType = {
        id: documents.length + 1,
        name: file.name,
        type: file.type.includes("pdf") ? "PDF" : "Document",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        lastModified: new Date().toISOString().split("T")[0],
        shared: false,
        status: "Draft",
      };

      setDocuments((prev) => [...prev, newDoc]);
      setUploadedFiles((prev) => ({ ...prev, [newDoc.id]: file }));

      // 👇 upload ke baad turant open new tab me
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  // ✅ Universal preview
  const handlePreview = (doc: DocType) => {
    let fileURL: string | undefined;

    if (uploadedFiles[doc.id]) {
      fileURL = URL.createObjectURL(uploadedFiles[doc.id]);
    } else if (doc.url) {
      fileURL = doc.url;
    }

    if (fileURL) {
      window.open(fileURL, "_blank");
    } else {
      alert("This file type cannot be previewed.");
    }
  };

  const handleDownload = (doc: DocType, e: React.MouseEvent) => {
    e.stopPropagation(); // ❌ prevent preview on click
    const blob = new Blob([`Placeholder for ${doc.name}`], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (doc: DocType, e: React.MouseEvent) => {
    e.stopPropagation(); // ❌ prevent preview
    const dummyLink = `${window.location.origin}/share/${doc.id}`;
    navigator.clipboard.writeText(dummyLink).then(() =>
      alert(`Share link copied: ${dummyLink}`)
    );
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // ❌ prevent preview
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  const handleSort = () => {
    const sorted = [...documents].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setDocuments(sorted);
    setSortAsc(!sortAsc);
  };

  const handleFilter = () =>
    setDocuments(initialDocuments.filter((doc) => doc.type === "PDF"));
  const clearSignature = () => sigPadRef.current?.clear();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>

        {/* Upload / Drag & Drop */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length)
              handleFileUpload({ target: { files: e.dataTransfer.files } });
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
        >
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleFileUpload}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <Upload size={18} className="text-primary-600 mb-2" />
            <span className="text-gray-600">Click or drag file here to upload</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Documents list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSort}>
                  Sort by Name
                </Button>
                <Button variant="outline" size="sm" onClick={handleFilter}>
                  Filter PDFs
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer"
                    onClick={() => handlePreview(doc)}
                  >
                    <div className="p-2 bg-primary-50 rounded-lg mr-4">
                      <FileText size={24} className="text-primary-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        {doc.shared && (
                          <Badge variant="secondary" size="sm">
                            Shared
                          </Badge>
                        )}
                        <Badge
                          variant={
                            doc.status === "Signed"
                              ? "success"
                              : doc.status === "In Review"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Modified {doc.lastModified}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        onClick={(e) => handleDownload(doc, e)}
                      >
                        <Download size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        onClick={(e) => handleShare(doc, e)}
                      >
                        <Share2 size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-error-600 hover:text-error-700"
                        onClick={(e) => handleDelete(doc.id, e)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* E-Signature */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-medium">E-Signature</h2>
            </CardHeader>
            <CardBody>
              <SignaturePad
                ref={sigPadRef}
                penColor="blue"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "border rounded-md",
                }}
              />
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  Clear
                </Button>
                <Button size="sm">Save Signature</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
