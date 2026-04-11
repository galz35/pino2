import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';

class ReceiptLineItem {
  const ReceiptLineItem({
    required this.description,
    required this.quantity,
    required this.unitPrice,
  });

  final String description;
  final int quantity;
  final double unitPrice;

  double get total => quantity * unitPrice;
}

class OrderReceiptPayload {
  const OrderReceiptPayload({
    required this.storeName,
    required this.createdAt,
    required this.sellerName,
    required this.clientName,
    required this.paymentType,
    required this.totalAmount,
    required this.items,
    this.notes,
    this.reference,
  });

  final String storeName;
  final DateTime createdAt;
  final String sellerName;
  final String clientName;
  final String paymentType;
  final double totalAmount;
  final List<ReceiptLineItem> items;
  final String? notes;
  final String? reference;
}

class CollectionReceiptPayload {
  const CollectionReceiptPayload({
    required this.storeName,
    required this.createdAt,
    required this.collectorName,
    required this.clientName,
    required this.amount,
    required this.paymentMethod,
    this.reference,
    this.notes,
  });

  final String storeName;
  final DateTime createdAt;
  final String collectorName;
  final String clientName;
  final double amount;
  final String paymentMethod;
  final String? reference;
  final String? notes;
}

class PdfReceiptService {
  const PdfReceiptService();

  Future<File> saveOrderReceipt(OrderReceiptPayload payload) async {
    final bytes = await buildOrderReceipt(payload);
    return _writeTempFile(
      'pedido_${_safeSegment(payload.clientName)}_${payload.createdAt.millisecondsSinceEpoch}.pdf',
      bytes,
    );
  }

  Future<File> saveCollectionReceipt(CollectionReceiptPayload payload) async {
    final bytes = await buildCollectionReceipt(payload);
    return _writeTempFile(
      'cobro_${_safeSegment(payload.clientName)}_${payload.createdAt.millisecondsSinceEpoch}.pdf',
      bytes,
    );
  }

  Future<Uint8List> buildOrderReceipt(OrderReceiptPayload payload) async {
    final doc = pw.Document(title: 'Comprobante de pedido');

    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a6,
        margin: const pw.EdgeInsets.all(18),
        build: (context) => [
          _headerBlock(
            title: 'Comprobante de pedido',
            storeName: payload.storeName,
            createdAt: payload.createdAt,
          ),
          pw.SizedBox(height: 10),
          _keyValue('Cliente', payload.clientName),
          _keyValue('Vendedor', payload.sellerName),
          _keyValue('Pago', payload.paymentType),
          if (payload.reference != null && payload.reference!.trim().isNotEmpty)
            _keyValue('Referencia', payload.reference!.trim()),
          pw.SizedBox(height: 12),
          _itemsTable(payload.items),
          pw.SizedBox(height: 10),
          _totalLine('Total', payload.totalAmount),
          if (payload.notes != null && payload.notes!.trim().isNotEmpty) ...[
            pw.SizedBox(height: 10),
            _noteBlock('Notas', payload.notes!.trim()),
          ],
        ],
      ),
    );

    return doc.save();
  }

  Future<Uint8List> buildCollectionReceipt(
    CollectionReceiptPayload payload,
  ) async {
    final doc = pw.Document(title: 'Comprobante de cobro');

    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a6,
        margin: const pw.EdgeInsets.all(18),
        build: (context) => [
          _headerBlock(
            title: 'Comprobante de cobro',
            storeName: payload.storeName,
            createdAt: payload.createdAt,
          ),
          pw.SizedBox(height: 10),
          _keyValue('Cliente', payload.clientName),
          _keyValue('Cobrador', payload.collectorName),
          _keyValue('Método', payload.paymentMethod),
          if (payload.reference != null && payload.reference!.trim().isNotEmpty)
            _keyValue('Referencia', payload.reference!.trim()),
          pw.SizedBox(height: 16),
          pw.Container(
            width: double.infinity,
            padding: const pw.EdgeInsets.all(12),
            decoration: pw.BoxDecoration(
              borderRadius: pw.BorderRadius.circular(10),
              color: PdfColors.grey100,
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'Monto recibido',
                  style: pw.TextStyle(
                    fontSize: 9,
                    color: PdfColors.grey700,
                  ),
                ),
                pw.SizedBox(height: 6),
                pw.Text(
                  'C\$ ${payload.amount.toStringAsFixed(2)}',
                  style: pw.TextStyle(
                    fontSize: 18,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          if (payload.notes != null && payload.notes!.trim().isNotEmpty) ...[
            pw.SizedBox(height: 10),
            _noteBlock('Notas', payload.notes!.trim()),
          ],
        ],
      ),
    );

    return doc.save();
  }

  Future<void> shareFile(
    File file, {
    BuildContext? context,
    String? subject,
    String? text,
  }) async {
    Rect? origin;
    if (context != null) {
      final box = context.findRenderObject() as RenderBox?;
      if (box != null && box.hasSize) {
        origin = box.localToGlobal(Offset.zero) & box.size;
      }
    }

    await Share.shareXFiles(
      [XFile(file.path)],
      subject: subject,
      text: text,
      sharePositionOrigin: origin,
    );
  }

  pw.Widget _headerBlock({
    required String title,
    required String storeName,
    required DateTime createdAt,
  }) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(12),
      decoration: pw.BoxDecoration(
        color: PdfColors.blueGrey900,
        borderRadius: pw.BorderRadius.circular(10),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            title,
            style: pw.TextStyle(
              color: PdfColors.white,
              fontSize: 15,
              fontWeight: pw.FontWeight.bold,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            storeName,
            style: const pw.TextStyle(
              color: PdfColors.white,
              fontSize: 10,
            ),
          ),
          pw.SizedBox(height: 2),
          pw.Text(
            _formatDateTime(createdAt),
            style: const pw.TextStyle(
              color: PdfColors.blue100,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }

  pw.Widget _keyValue(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 60,
            child: pw.Text(
              label,
              style: const pw.TextStyle(
                fontSize: 8,
                color: PdfColors.grey700,
              ),
            ),
          ),
          pw.Expanded(
            child: pw.Text(
              value,
              style: pw.TextStyle(
                fontSize: 9,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  pw.Widget _itemsTable(List<ReceiptLineItem> items) {
    return pw.Table(
      border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
      columnWidths: const {
        0: pw.FlexColumnWidth(2.6),
        1: pw.FlexColumnWidth(0.8),
        2: pw.FlexColumnWidth(1.1),
      },
      children: [
        pw.TableRow(
          decoration: const pw.BoxDecoration(color: PdfColors.grey200),
          children: [
            _tableCell('Producto', bold: true),
            _tableCell('Cant.', bold: true, align: pw.TextAlign.center),
            _tableCell('Total', bold: true, align: pw.TextAlign.right),
          ],
        ),
        ...items.map(
          (item) => pw.TableRow(
            children: [
              _tableCell(item.description),
              _tableCell('${item.quantity}', align: pw.TextAlign.center),
              _tableCell(
                'C\$ ${item.total.toStringAsFixed(2)}',
                align: pw.TextAlign.right,
              ),
            ],
          ),
        ),
      ],
    );
  }

  pw.Widget _tableCell(
    String text, {
    bool bold = false,
    pw.TextAlign align = pw.TextAlign.left,
  }) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(6),
      child: pw.Text(
        text,
        textAlign: align,
        style: pw.TextStyle(
          fontSize: 8,
          fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal,
        ),
      ),
    );
  }

  pw.Widget _totalLine(String label, double amount) {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.end,
      children: [
        pw.Text(
          '$label: ',
          style: pw.TextStyle(
            fontSize: 10,
            fontWeight: pw.FontWeight.bold,
          ),
        ),
        pw.Text(
          'C\$ ${amount.toStringAsFixed(2)}',
          style: pw.TextStyle(
            fontSize: 12,
            fontWeight: pw.FontWeight.bold,
          ),
        ),
      ],
    );
  }

  pw.Widget _noteBlock(String title, String value) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(10),
      decoration: pw.BoxDecoration(
        borderRadius: pw.BorderRadius.circular(10),
        border: pw.Border.all(color: PdfColors.grey300, width: 0.5),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            title,
            style: const pw.TextStyle(
              fontSize: 8,
              color: PdfColors.grey700,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            value,
            style: const pw.TextStyle(fontSize: 9),
          ),
        ],
      ),
    );
  }

  Future<File> _writeTempFile(String fileName, Uint8List bytes) async {
    final directory = await getTemporaryDirectory();
    final file = File(p.join(directory.path, fileName));
    return file.writeAsBytes(bytes, flush: true);
  }

  String _formatDateTime(DateTime value) {
    final local = value.toLocal();
    final year = local.year.toString().padLeft(4, '0');
    final month = local.month.toString().padLeft(2, '0');
    final day = local.day.toString().padLeft(2, '0');
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '$year-$month-$day $hour:$minute';
  }

  String _safeSegment(String raw) {
    final normalized = raw
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
        .replaceAll(RegExp(r'_+'), '_')
        .replaceAll(RegExp(r'^_|_$'), '');
    return normalized.isEmpty ? 'documento' : normalized;
  }
}

final pdfReceiptServiceProvider = Provider<PdfReceiptService>((ref) {
  return const PdfReceiptService();
});
