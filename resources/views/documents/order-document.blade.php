<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $document->typeLabel() }} - {{ $document->document_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            margin: 0;
            padding: 24px;
        }
        .toolbar {
            max-width: 820px;
            margin: 0 auto 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 10px;
            border: none;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-primary { background: #086f8e; color: #fff; }
        .btn-secondary { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
        .sheet {
            max-width: 820px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0a2540;
            padding-bottom: 20px;
            margin-bottom: 24px;
            gap: 20px;
        }
        .company-name { font-size: 20px; font-weight: 800; color: #0a2540; margin: 0; }
        .company-sub { font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 18px; font-weight: 800; color: #086f8e; margin: 0; text-transform: uppercase; }
        .doc-num { font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700; margin-top: 4px; }
        .stamp {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            border: 1px solid #10b981;
            color: #047857;
            background: #ecfdf5;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
            font-size: 12px;
        }
        .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            line-height: 1.6;
        }
        .meta-box strong.label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 12px;
        }
        th {
            background: #0a2540;
            color: #fff;
            padding: 10px 12px;
            text-align: left;
            font-weight: 700;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .num { text-align: right; white-space: nowrap; }
        .summary-wrap {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 28px;
        }
        .summary {
            width: 320px;
            font-size: 12px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .summary-row.total {
            font-size: 15px;
            font-weight: 800;
            color: #0a2540;
            border-top: 2px solid #0a2540;
            border-bottom: 2px solid #0a2540;
            padding: 10px 0;
            margin-top: 6px;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #64748b;
        }
        .sign { text-align: center; min-width: 200px; color: #0f172a; }
        .sign-line { margin-top: 56px; border-top: 1px solid #334155; padding-top: 6px; font-weight: 700; }
        @media print {
            body { background: #fff; padding: 0; }
            .toolbar { display: none; }
            .sheet { box-shadow: none; border: none; border-radius: 0; padding: 12px; max-width: none; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <a href="javascript:history.back()" class="btn btn-secondary">← Kembali</a>
        <div style="display:flex;gap:8px;">
            <a href="{{ $downloadUrl }}" class="btn btn-secondary">Unduh PDF</a>
            <button type="button" onclick="window.print()" class="btn btn-primary">Cetak / Simpan PDF</button>
        </div>
    </div>

    <div class="sheet">
        <div class="header">
            <div>
                <h2 class="company-name">CV. PUTRA NUGRAHA</h2>
                <div class="company-sub">
                    Perdagangan Barang &amp; Jasa Pengadaan IT<br>
                    Bandung, Jawa Barat • WhatsApp: (+62) 813-2077-7874
                </div>
            </div>
            <div class="doc-title">
                <h1>{{ $document->type === 'purchase_receipt' ? 'Bukti Pembelian' : 'Invoice Resmi' }}</h1>
                <div class="doc-num">{{ $document->document_number }}</div>
                <div class="stamp">
                    {{ $document->type === 'purchase_receipt' ? 'LUNAS & SERAH TERIMA' : strtoupper($order->paymentStatusLabel()) }}
                </div>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-box">
                <strong class="label">Ditujukan Kepada</strong>
                <strong>{{ $order->company_name ?: $order->buyer_name }}</strong><br>
                PIC: {{ $order->buyer_name }} {{ $order->buyer_phone ? '('.$order->buyer_phone.')' : '' }}<br>
                {{ $order->shipping_address }}<br>
                @if($order->npwp_number)
                    NPWP: <span style="font-family:monospace;">{{ $order->npwp_number }}</span>
                @endif
            </div>
            <div class="meta-box">
                <strong class="label">Detail Dokumen</strong>
                No. Pesanan: <strong>{{ $order->order_number }}</strong><br>
                Tanggal Terbit: {{ $document->issued_at?->translatedFormat('d M Y, H:i') }} WIB<br>
                @if($order->spk_number)
                    No. SPK / SPH: {{ $order->spk_number }}<br>
                @endif
                @if($order->pr_reference)
                    Ref PR / RFQ: {{ $order->pr_reference }}<br>
                @endif
                Tahap Pesanan: {{ $order->statusLabel() }}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:40px;">No</th>
                    <th>Deskripsi Barang / Jasa</th>
                    <th class="num">Qty</th>
                    <th class="num">Harga Satuan</th>
                    <th class="num">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $idx => $item)
                    <tr>
                        <td>{{ $idx + 1 }}</td>
                        <td>
                            <strong>{{ $item->product_name }}</strong>
                            @if($item->product_sku)
                                <div style="font-size:11px;color:#64748b;">SKU: {{ $item->product_sku }}</div>
                            @endif
                        </td>
                        <td class="num">{{ $item->quantity }} {{ $item->unit ?: 'unit' }}</td>
                        <td class="num">Rp {{ number_format((float) $item->unit_price, 0, ',', '.') }}</td>
                        <td class="num"><strong>Rp {{ number_format((float) $item->line_total, 0, ',', '.') }}</strong></td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-wrap">
            <div class="summary">
                <div class="summary-row">
                    <span>Dasar Pengenaan Pajak (DPP)</span>
                    <span>Rp {{ number_format((float) $document->dpp_amount, 0, ',', '.') }}</span>
                </div>
                <div class="summary-row">
                    <span>PPN 11% (Inklusif)</span>
                    <span>Rp {{ number_format((float) $document->ppn_amount, 0, ',', '.') }}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Tagihan</span>
                    <span>Rp {{ number_format((float) $document->total_amount, 0, ',', '.') }}</span>
                </div>
                <div class="summary-row">
                    <span>Total Terbayar (Terverifikasi)</span>
                    <strong style="color:#047857;">Rp {{ number_format($order->verifiedPaidAmount(), 0, ',', '.') }}</strong>
                </div>
                <div class="summary-row">
                    <span>Sisa Tagihan</span>
                    <strong>Rp {{ number_format($order->remainingAmount(), 0, ',', '.') }}</strong>
                </div>
            </div>
        </div>

        @if($order->payments->where('status', 'verified')->isNotEmpty())
            <div style="margin-bottom:20px;">
                <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#0a2540;">Riwayat Pembayaran Terverifikasi</div>
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Jenis</th>
                            <th>Metode &amp; Referensi</th>
                            <th class="num">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->payments->where('status', 'verified') as $pay)
                            <tr>
                                <td>{{ $pay->paid_at?->translatedFormat('d M Y') }}</td>
                                <td>{{ $pay->typeLabel() }}</td>
                                <td>{{ $pay->payment_method }} {{ $pay->payment_reference ? '('.$pay->payment_reference.')' : '' }}</td>
                                <td class="num">Rp {{ number_format((float) $pay->amount, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        @if($document->notes)
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:12px;margin-bottom:16px;">
                <strong>Catatan:</strong> {{ $document->notes }}
            </div>
        @endif

        <div class="footer">
            <div>
                Dokumen resmi diterbitkan melalui Portal B2B CV. Putra Nugraha.<br>
                Simpan dokumen ini sebagai arsip administrasi pengadaan Anda.
            </div>
            <div class="sign">
                <div>Bandung, {{ $document->issued_at?->translatedFormat('d M Y') }}</div>
                <div class="sign-line">CV. Putra Nugraha</div>
            </div>
        </div>
    </div>
</body>
</html>
