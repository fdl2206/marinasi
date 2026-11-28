<?php

namespace App\Services;

use App\Models\OrderDocument;

/**
 * Pure-PHP valid PDF 1.4 generator (tanpa ketergantungan ekstensi GD atau paket eksternal)
 * untuk menghasilkan file PDF Invoice & Bukti Pembelian CV. Putra Nugraha.
 */
class SimplePdfService
{
    public function renderOrderDocument(OrderDocument $document): string
    {
        $document->loadMissing(['order.items', 'order.payments']);
        $order = $document->order;

        $isReceipt = $document->type === OrderDocument::TYPE_PURCHASE_RECEIPT;
        $title = $isReceipt ? 'BUKTI PEMBELIAN / KWITANSI LUNAS' : 'INVOICE RESMI PENGADAAN B2B';

        $lines = [];
        $lines[] = ['size' => 15, 'bold' => true, 'text' => 'CV. PUTRA NUGRAHA'];
        $lines[] = ['size' => 9, 'bold' => false, 'text' => 'Perdagangan Barang & Jasa IT | Bandung, Jawa Barat | WA: (+62) 813-2077-7874'];
        $lines[] = ['size' => 10, 'bold' => false, 'text' => str_repeat('-', 86)];
        $lines[] = ['size' => 13, 'bold' => true, 'text' => $title];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'No. Dokumen : '.$document->document_number];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'No. Pesanan : '.$order->order_number.($order->spk_number ? ' | SPK/SPH: '.$order->spk_number : '')];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'Tanggal Terbit : '.($document->issued_at?->format('d/m/Y H:i') ?? now()->format('d/m/Y H:i')).' WIB'];
        $lines[] = ['size' => 9.5, 'bold' => true, 'text' => 'Status Pembayaran : '.$order->paymentStatusLabel()];
        $lines[] = ['size' => 9, 'bold' => false, 'text' => ' '];

        $lines[] = ['size' => 10, 'bold' => true, 'text' => 'KEPADA YTH:'];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'Instansi / Perusahaan : '.($order->company_name ?: $order->buyer_name)];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'PIC : '.$order->buyer_name.($order->buyer_phone ? ' ('.$order->buyer_phone.')' : '')];
        if ($order->npwp_number) {
            $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'NPWP : '.$order->npwp_number];
        }
        foreach ($this->wrapText('Alamat : '.$order->shipping_address, 84) as $addrLine) {
            $lines[] = ['size' => 9, 'bold' => false, 'text' => $addrLine];
        }

        $lines[] = ['size' => 9, 'bold' => false, 'text' => str_repeat('-', 86)];
        $lines[] = ['size' => 9.5, 'bold' => true, 'text' => 'RINCIAN BARANG / JASA:'];

        foreach ($order->items as $idx => $item) {
            $label = sprintf(
                '%d. %s (%d %s x %s) = %s',
                $idx + 1,
                $item->product_name,
                $item->quantity,
                $item->unit ?: 'unit',
                $this->rupiah((float) $item->unit_price),
                $this->rupiah((float) $item->line_total),
            );
            foreach ($this->wrapText($label, 84) as $itemLine) {
                $lines[] = ['size' => 9, 'bold' => false, 'text' => $itemLine];
            }
        }

        $lines[] = ['size' => 9, 'bold' => false, 'text' => str_repeat('-', 86)];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'DPP (Dasar Pengenaan Pajak) : '.$this->rupiah((float) $document->dpp_amount)];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'PPN 11% (Termasuk)          : '.$this->rupiah((float) $document->ppn_amount)];
        $lines[] = ['size' => 11, 'bold' => true, 'text' => 'TOTAL TAGIHAN               : '.$this->rupiah((float) $document->total_amount)];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'Total Terbayar (Terverifikasi): '.$this->rupiah($order->verifiedPaidAmount())];
        $lines[] = ['size' => 9.5, 'bold' => false, 'text' => 'Sisa Tagihan                : '.$this->rupiah($order->remainingAmount())];

        if ($document->notes) {
            $lines[] = ['size' => 9, 'bold' => false, 'text' => ' '];
            foreach ($this->wrapText('Catatan: '.$document->notes, 84) as $noteLine) {
                $lines[] = ['size' => 9, 'bold' => false, 'text' => $noteLine];
            }
        }

        $lines[] = ['size' => 9, 'bold' => false, 'text' => ' '];
        $lines[] = ['size' => 8.5, 'bold' => false, 'text' => 'Dokumen ini diterbitkan secara resmi melalui Portal B2B CV. Putra Nugraha.'];

        return $this->buildPdfFromLines($lines);
    }

    /** @param list<array{size: float|int, bold: bool, text: string}> $lines */
    private function buildPdfFromLines(array $lines): string
    {
        $contentCommands = [];
        $y = 800;

        foreach ($lines as $line) {
            if ($y < 50) {
                break;
            }
            $fontKey = $line['bold'] ? '/F2' : '/F1';
            $size = $line['size'];
            $escaped = $this->escapePdfText($line['text']);
            $contentCommands[] = sprintf('BT %s %.1f Tf 45 %.1f Td (%s) Tj ET', $fontKey, $size, $y, $escaped);
            $y -= ($size + 5.5);
        }

        $stream = implode("\n", $contentCommands);
        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            3 => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
            4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
            6 => sprintf("<< /Length %d >>\nstream\n%s\nendstream", strlen($stream), $stream),
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $num => $body) {
            $offsets[$num] = strlen($pdf);
            $pdf .= "{$num} 0 obj\n{$body}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF\n";

        return $pdf;
    }

    private function escapePdfText(string $text): string
    {
        $clean = preg_replace('/[^\x20-\x7E]/', ' ', $text) ?? '';

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $clean);
    }

    /** @return list<string> */
    private function wrapText(string $text, int $maxLength): array
    {
        $normalized = preg_replace('/\s+/', ' ', trim($text)) ?? '';

        return explode("\n", wordwrap($normalized, $maxLength, "\n", true));
    }

    private function rupiah(float $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}
