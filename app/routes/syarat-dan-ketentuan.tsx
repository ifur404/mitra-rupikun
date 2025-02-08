import { MyLayout } from "./_index";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        {
            title:
                "Syarat dan Ketentuan - Mitra UpkanID: Ketentuan Penggunaan Layanan",
        },
        {
            name: "description",
            content:
                "Baca syarat dan ketentuan penggunaan layanan Mitra UpkanID, termasuk ketentuan pembayaran, hak kekayaan intelektual, batasan tanggung jawab, dan ketentuan pengembalian dana.",
        },
        {
            name: "keywords",
            content:
                "Mitra UpkanID, syarat dan ketentuan, ketentuan penggunaan, kebijakan privasi, PPOB, pulsa, e-wallet, PLN, top up game, ketentuan pengembalian dana",
        },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "Mitra UpkanID" },
        {
            property: "og:title",
            content:
                "Syarat dan Ketentuan - Mitra UpkanID: Ketentuan Penggunaan Layanan",
        },
        {
            property: "og:description",
            content:
                "Baca syarat dan ketentuan penggunaan layanan Mitra UpkanID, termasuk ketentuan pembayaran, hak kekayaan intelektual, batasan tanggung jawab, dan ketentuan pengembalian dana.",
        },
        { property: "og:type", content: "website" },
        {
            property: "og:url",
            content: "https://mitra.rupikun.com/syarat-dan-ketentuan", // Ganti jika URL berbeda
        },
        {
            property: "og:image",
            content: "https://mitra.rupikun.com/logo-icon.png", // Ganti dengan URL logo yang sesuai
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:title",
            content:
                "Syarat dan Ketentuan - Mitra UpkanID: Ketentuan Penggunaan Layanan",
        },
        {
            name: "twitter:description",
            content:
                "Baca syarat dan ketentuan penggunaan layanan Mitra UpkanID, termasuk ketentuan pembayaran, hak kekayaan intelektual, batasan tanggung jawab, dan ketentuan pengembalian dana.",
        },
        {
            name: "twitter:image",
            content: "https://mitra.rupikun.com/logo-icon.png", // Ganti dengan URL logo yang sesuai
        },
    ];
};


export default function syaratdanketentuan() {
    return <MyLayout>
        <SyaratDanKetentuan />
    </MyLayout>
}

const SyaratDanKetentuan = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="prose prose-sm">
                <h1>Syarat dan Ketentuan</h1>

                <p>
                    Selamat datang di Mitra UpkanID! Halaman ini berisi syarat dan
                    ketentuan yang mengatur penggunaan layanan kami. Dengan mengakses atau
                    menggunakan layanan Mitra UpkanID, Anda setuju untuk terikat oleh
                    syarat dan ketentuan ini. Jika Anda tidak setuju dengan salah satu
                    ketentuan ini, mohon untuk tidak menggunakan layanan kami,
                </p>

                <h2>1. Penggunaan Layanan</h2>
                <p>
                    Anda setuju untuk menggunakan layanan Mitra UpkanID hanya untuk tujuan
                    yang sah dan sesuai dengan hukum yang berlaku. Anda tidak diperkenankan
                    untuk menggunakan layanan kami untuk kegiatan ilegal atau melanggar hak
                    orang lain.
                </p>

                <h2>2. Akun Pengguna</h2>
                <p>
                    Untuk menggunakan beberapa fitur layanan kami, Anda mungkin perlu
                    membuat akun pengguna. Anda bertanggung jawab untuk menjaga kerahasiaan
                    informasi akun Anda dan setuju untuk bertanggung jawab atas semua
                    aktivitas yang terjadi di bawah akun Anda.
                </p>

                <h2>3. Pembayaran</h2>
                <p>
                    Anda setuju untuk membayar semua biaya yang terkait dengan penggunaan
                    layanan kami sesuai dengan harga yang berlaku. Kami berhak untuk
                    mengubah harga layanan kami sewaktu-waktu.
                </p>

                <h2>4. Hak Kekayaan Intelektual</h2>
                <p>
                    Semua konten yang terdapat dalam layanan Mitra UpkanID, termasuk namun
                    tidak terbatas pada teks, gambar, logo, dan perangkat lunak, adalah
                    milik Mitra UpkanID atau pemberi lisensi kami dan dilindungi oleh hukum
                    hak kekayaan intelektual.
                </p>

                <h2>5. Batasan Tanggung Jawab</h2>
                <p>
                    Mitra UpkanID tidak bertanggung jawab atas kerugian atau kerusakan yang
                    mungkin timbul akibat penggunaan layanan kami. Kami tidak menjamin bahwa
                    layanan kami akan selalu tersedia atau bebas dari kesalahan.
                </p>

                <h2>6. Perubahan Syarat dan Ketentuan</h2>
                <p>
                    Kami berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu.
                    Perubahan akan berlaku efektif setelah diposting di halaman ini. Anda
                    bertanggung jawab untuk memeriksa halaman ini secara berkala untuk
                    mengetahui perubahan terbaru.
                </p>

                <h2>7. Hukum yang Berlaku</h2>
                <p>
                    Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan
                    hukum yang berlaku di Indonesia.
                </p>

                <h2>8. Ketentuan Pengembalian (Return)</h2>
                <p>
                    <strong>8.1. Layanan yang Tidak Dapat Dikembalikan:</strong>
                    <br />
                    Karena sifat layanan PPOB dan top-up digital, sebagian besar transaksi
                    tidak dapat dibatalkan atau dikembalikan setelah berhasil diproses. Ini
                    termasuk, namun tidak terbatas pada, pengisian pulsa, top up e-wallet,
                    pembayaran tagihan, dan top up game.
                </p>
                <p>
                    <strong>8.2. Pengecualian:</strong>
                    <br />
                    Pengembalian dana mungkin dipertimbangkan dalam kasus-kasus berikut:
                    <ol className="list-decimal pl-5">
                        <li>
                            Transaksi gagal karena kesalahan sistem kami dan dana telah
                            terpotong dari saldo Anda.
                        </li>
                        <li>
                            Layanan tidak dapat dipenuhi karena alasan yang berada di luar
                            kendali Anda dan kami.
                        </li>
                    </ol>
                </p>
                <p>
                    <strong>8.3. Proses Pengembalian:</strong>
                    <br />
                    Untuk mengajukan pengembalian dana, Anda harus menghubungi tim dukungan
                    pelanggan kami melalui email di <a href="mailto:upkanid@gmail.com">upkanid@gmail.com</a> atau melalui
                    Telegram di <a href="https://t.me/ruprupi">@ruprupi</a> dalam waktu 24
                    jam setelah transaksi terjadi. Anda harus memberikan bukti transaksi
                    yang valid dan menjelaskan alasan pengembalian dana.
                </p>
                <p>
                    <strong>8.4. Waktu Pemrosesan:</strong>
                    <br />
                    Kami akan meninjau permintaan pengembalian dana Anda dan memberikan
                    keputusan dalam waktu 3-5 hari kerja. Jika pengembalian dana disetujui,
                    dana akan dikembalikan ke saldo akun Anda atau ke metode pembayaran
                    awal Anda, tergantung pada kebijakan kami.
                </p>
                <p>
                    <strong>8.5. Kebijakan Perubahan:</strong>
                    <br />
                    Kami berhak untuk mengubah kebijakan pengembalian dana ini sewaktu-waktu
                    tanpa pemberitahuan sebelumnya.
                </p>

                <p className="mt-8">
                    Terima kasih telah menggunakan Mitra UpkanID!
                </p>
            </div>
        </div>
    );
};
