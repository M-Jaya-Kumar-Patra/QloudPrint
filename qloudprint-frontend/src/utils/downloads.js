const escapePdfText = (value) =>
  String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

export const openDocument = (url) => {
  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const downloadDocument = async (url, fileName = "document.pdf") => {
  if (!url) {
    return;
  }

  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName || "document.pdf";
  link.click();
  URL.revokeObjectURL(objectUrl);
};

export const downloadInvoicePdf = (order) => {
  const rows = [
    "QloudPrint Invoice",
    `Order Code: ${order.orderCode}`,
    `File: ${order.fileName}`,
    `Shop: ${order.shop?.name || "Selected shop"}`,
    `Copies: ${order.copies}`,
    `Pages: ${Number(order.pageCount || 0) * Number(order.copies || 1)}`,
    `Paper: ${order.paperSize}`,
    `Print Side: ${order.printSide || "SINGLE_SIDED"}`,
    `Binding: ${order.bindingType || "NONE"}`,
    `Instructions: ${order.specialInstructions || "None"}`,
    `Amount: Rs ${order.totalCost}`,
    `Status: ${order.status}`,
  ];

  const textLines = rows
    .map((row, index) => `BT /F1 ${index === 0 ? 22 : 12} Tf 54 ${760 - index * 28} Td (${escapePdfText(row)}) Tj ET`)
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${textLines.length} >>\nstream\n${textLines}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${order.orderCode || "qloudprint"}-invoice.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
