import { MyLayout } from "./_index";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Kebijakan Privasi - Mitra UpkanID" },
    {
      name: "description",
      content:
        "Baca Kebijakan Privasi Mitra UpkanID untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.",
    },
    {
      name: "keywords",
      content:
        "Mitra UpkanID, kebijakan privasi, privasi, data pribadi, perlindungan data",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Mitra UpkanID" },
    { property: "og:title", content: "Kebijakan Privasi - Mitra UpkanID" },
    {
      property: "og:description",
      content:
        "Baca Kebijakan Privasi Mitra UpkanID untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.",
    },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: "https://mitra.rupikun.com/kebijakan-privasi",
    },
    {
      property: "og:image",
      content: "https://mitra.rupikun.com/logo-icon.png",
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Kebijakan Privasi - Mitra UpkanID" },
    {
      name: "twitter:description",
      content:
        "Baca Kebijakan Privasi Mitra UpkanID untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.",
    },
    {
      name: "twitter:image",
      content: "https://mitra.rupikun.com/logo-icon.png", 
    },
  ];
};


export default function kebijakanprivasi() {
  return (
    <MyLayout>
      <KebijakanPrivasi />
    </MyLayout>
  )
}

const KebijakanPrivasi = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="prose prose-sm lg:prose">
        <h1>Kebijakan Privasi</h1>

        <p>
          Selamat datang di Mitra UpkanID! Kebijakan Privasi ini menjelaskan
          bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi
          pribadi Anda saat Anda menggunakan layanan kami. Kami berkomitmen
          untuk melindungi privasi Anda dan memastikan bahwa informasi pribadi
          Anda ditangani dengan aman dan bertanggung jawab.
        </p>

        <h2>1. Informasi yang Kami Kumpulkan</h2>
        <p>
          Kami dapat mengumpulkan informasi pribadi berikut dari Anda:
          <ul>
            <li>Nama</li>
            <li>Alamat email</li>
            <li>Nomor telepon</li>
            <li>Informasi pembayaran</li>
            <li>Informasi perangkat</li>
            <li>Data penggunaan layanan</li>
          </ul>
        </p>

        <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
        <p>
          Kami menggunakan informasi pribadi Anda untuk tujuan berikut:
          <ul>
            <li>Menyediakan dan memelihara layanan kami</li>
            <li>Memproses transaksi Anda</li>
            <li>Memberikan dukungan pelanggan</li>
            <li>Mengirimkan pemberitahuan dan informasi penting</li>
            <li>Meningkatkan layanan kami</li>
            <li>Mencegah penipuan dan penyalahgunaan</li>
          </ul>
        </p>

        <h2>3. Bagaimana Kami Melindungi Informasi Anda</h2>
        <p>
          Kami mengambil langkah-langkah keamanan yang wajar untuk melindungi
          informasi pribadi Anda dari akses yang tidak sah, penggunaan, atau
          pengungkapan. Langkah-langkah ini termasuk enkripsi, firewall, dan
          kontrol akses fisik.
        </p>

        <h2>4. Berbagi Informasi Anda</h2>
        <p>
          Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada
          pihak ketiga. Kami dapat berbagi informasi pribadi Anda dengan pihak
          ketiga berikut:
          <ul>
            <li>Penyedia layanan pembayaran</li>
            <li>Penyedia layanan hosting</li>
            <li>Penyedia layanan analitik</li>
            <li>Otoritas pemerintah jika diwajibkan oleh hukum</li>
          </ul>
        </p>

        <h2>5. Hak Anda</h2>
        <p>
          Anda memiliki hak berikut terkait dengan informasi pribadi Anda:
          <ul>
            <li>Hak untuk mengakses informasi Anda</li>
            <li>Hak untuk memperbaiki informasi Anda</li>
            <li>Hak untuk menghapus informasi Anda</li>
            <li>Hak untuk membatasi pemrosesan informasi Anda</li>
            <li>Hak untuk mengajukan keberatan terhadap pemrosesan informasi Anda</li>
          </ul>
        </p>

        <h2>6. Perubahan Kebijakan Privasi</h2>
        <p>
          Kami berhak untuk mengubah Kebijakan Privasi ini sewaktu-waktu.
          Perubahan akan berlaku efektif setelah diposting di halaman ini. Anda
          bertanggung jawab untuk memeriksa halaman ini secara berkala untuk
          mengetahui perubahan terbaru.
        </p>

        <h2>7. Hubungi Kami</h2>
        <p>
          Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan
          Privasi ini, silakan hubungi kami melalui email di
          <a href="mailto:upkanid@gmail.com">upkanid@gmail.com</a> atau melalui
          Telegram di <a href="https://t.me/ruprupi">@ruprupi</a>.
        </p>
      </div>
    </div>
  );
};