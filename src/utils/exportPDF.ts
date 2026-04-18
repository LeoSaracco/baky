import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatARS } from './calcCostos';
import type { Receta, Presupuesto, Producto } from '../types';
import { calcCostoReceta } from './calcCostos';

// ─────────────────────────────────────────────────────────────────────────────
// Export element as PDF via html2canvas
// ─────────────────────────────────────────────────────────────────────────────

export async function exportElementToPDF(
  elementId: string,
  filename: string
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, {
    backgroundColor: '#141414',
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// Export presupuesto as PDF (jsPDF direct)
// ─────────────────────────────────────────────────────────────────────────────

export function exportPresupuestoPDF(
  presupuesto: Presupuesto,
  recetas: Receta[]
): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const recetaMap = new Map(recetas.map((r) => [r.id, r]));

  // Background
  pdf.setFillColor(10, 10, 10);
  pdf.rect(0, 0, 210, 297, 'F');

  // Header band
  pdf.setFillColor(20, 20, 20);
  pdf.rect(0, 0, 210, 40, 'F');

  // Logo
  pdf.setTextColor(244, 114, 182);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'light');
  pdf.text('Baky', 15, 25);

  // Title
  pdf.setFontSize(11);
  pdf.setTextColor(161, 161, 170);
  pdf.text('PRESUPUESTO', 15, 34);

  // Number
  pdf.setFontSize(16);
  pdf.setTextColor(249, 249, 249);
  pdf.setFont('helvetica', 'bold');
  pdf.text(presupuesto.numero, 195, 25, { align: 'right' });

  // Client info
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(161, 161, 170);
  pdf.text('Cliente:', 15, 52);
  pdf.setTextColor(249, 249, 249);
  pdf.text(presupuesto.cliente, 45, 52);

  pdf.setTextColor(161, 161, 170);
  pdf.text('Emisión:', 15, 60);
  pdf.setTextColor(249, 249, 249);
  pdf.text(new Date(presupuesto.fechaEmision).toLocaleDateString('es-AR'), 45, 60);

  pdf.setTextColor(161, 161, 170);
  pdf.text('Vencimiento:', 15, 68);
  pdf.setTextColor(249, 249, 249);
  pdf.text(new Date(presupuesto.fechaVencimiento).toLocaleDateString('es-AR'), 45, 68);

  // Table header
  let y = 82;
  pdf.setFillColor(37, 37, 37);
  pdf.rect(15, y - 6, 180, 10, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(161, 161, 170);
  pdf.text('RECETA', 18, y);
  pdf.text('CANT.', 120, y);
  pdf.text('PRECIO UNIT.', 140, y);
  pdf.text('SUBTOTAL', 185, y, { align: 'right' });

  y += 8;
  pdf.setTextColor(249, 249, 249);
  pdf.setFontSize(10);

  let subtotalItems = 0;
  for (const item of presupuesto.items) {
    const receta = recetaMap.get(item.recetaId);
    const nombre = receta?.nombre ?? 'Receta';
    const subtotal = item.cantidad * item.precioUnitario;
    subtotalItems += subtotal;

    pdf.text(nombre, 18, y);
    pdf.text(String(item.cantidad), 120, y);
    pdf.text(formatARS(item.precioUnitario), 140, y);
    pdf.text(formatARS(subtotal), 185, y, { align: 'right' });
    y += 8;

    pdf.setDrawColor(40, 40, 40);
    pdf.line(15, y - 2, 195, y - 2);
  }

  // Totals
  y += 6;
  const descuentoVal = subtotalItems * (presupuesto.descuento / 100);
  const impuestosVal = (subtotalItems - descuentoVal) * (presupuesto.impuestos / 100);
  const total = subtotalItems - descuentoVal + impuestosVal;

  pdf.setFontSize(10);
  pdf.setTextColor(161, 161, 170);
  pdf.text('Subtotal:', 140, y);
  pdf.setTextColor(249, 249, 249);
  pdf.text(formatARS(subtotalItems), 185, y, { align: 'right' });
  y += 8;

  if (presupuesto.descuento > 0) {
    pdf.setTextColor(161, 161, 170);
    pdf.text(`Descuento (${presupuesto.descuento}%):`, 140, y);
    pdf.setTextColor(254, 202, 202);
    pdf.text(`-${formatARS(descuentoVal)}`, 185, y, { align: 'right' });
    y += 8;
  }

  if (presupuesto.impuestos > 0) {
    pdf.setTextColor(161, 161, 170);
    pdf.text(`Impuestos (${presupuesto.impuestos}%):`, 140, y);
    pdf.setTextColor(249, 249, 249);
    pdf.text(formatARS(impuestosVal), 185, y, { align: 'right' });
    y += 8;
  }

  // Total line
  pdf.setFillColor(244, 114, 182, 0.1);
  pdf.rect(130, y, 65, 14, 'F');
  pdf.setDrawColor(244, 114, 182);
  pdf.rect(130, y, 65, 14, 'D');
  y += 10;
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(244, 114, 182);
  pdf.text('TOTAL:', 140, y);
  pdf.text(formatARS(total), 185, y, { align: 'right' });

  // Notes
  if (presupuesto.notas) {
    y += 20;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(161, 161, 170);
    pdf.text('Notas:', 15, y);
    y += 6;
    pdf.setTextColor(249, 249, 249);
    const lines = pdf.splitTextToSize(presupuesto.notas, 180);
    pdf.text(lines, 15, y);
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(82, 82, 91);
  pdf.text('Generado con Baky — Sistema de gestión para emprendedores gastronómicos', 105, 285, { align: 'center' });

  pdf.save(`presupuesto-${presupuesto.numero.replace('#', '')}-${presupuesto.cliente.replace(/\s/g, '-')}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Export costos CSV
// ─────────────────────────────────────────────────────────────────────────────

export function exportCostosCSV(
  recetas: Receta[],
  productos: Producto[]
): void {
  const headers = ['Receta', 'Categoría', 'Materiales', 'Mano de Obra', 'Packaging', 'Impuestos', 'Costo Total', 'Precio Venta', 'Margen %'];
  const rows = recetas.map((r) => {
    const c = calcCostoReceta(r, productos);
    return [
      r.nombre,
      r.categoria,
      c.costoMateriales.toFixed(2),
      c.costoManoDeObra.toFixed(2),
      c.costoPackaging.toFixed(2),
      c.impuestos.toFixed(2),
      c.costoTotal.toFixed(2),
      c.precioVenta.toFixed(2),
      c.margenReal.toFixed(1) + '%',
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `baky-costos-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Share via WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

export function compartirWhatsApp(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
