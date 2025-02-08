import { MyLayout } from "./_index";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Kontak Kami - Mitra UpkanID" },
    {
      name: "description",
      content:
        "Hubungi Mitra UpkanID untuk pertanyaan, masukan, atau bantuan. Kirim pesan melalui email atau Telegram kami.",
    },
    {
      name: "keywords",
      content:
        "Mitra UpkanID, kontak, hubungi kami, email, Telegram, informasi kontak",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Mitra UpkanID" },
    { property: "og:title", content: "Kontak Kami - Mitra UpkanID" },
    {
      property: "og:description",
      content:
        "Hubungi Mitra UpkanID untuk pertanyaan, masukan, atau bantuan. Kirim pesan melalui email atau Telegram kami.",
    },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: "https://mitra.rupikun.com/kontak", // Ganti jika URL berbeda
    },
    {
      property: "og:image",
      content: "https://mitra.rupikun.com/logo-icon.png", // Ganti dengan URL logo yang sesuai
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Kontak Kami - Mitra UpkanID" },
    {
      name: "twitter:description",
      content:
        "Hubungi Mitra UpkanID untuk pertanyaan, masukan, atau bantuan. Kirim pesan melalui email atau Telegram kami.",
    },
    {
      name: "twitter:image",
      content: "https://mitra.rupikun.com/logo-icon.png", // Ganti dengan URL logo yang sesuai
    },
  ];
};


export default function kontak() {
  return (
    <MyLayout>
        <Kontak />
    </MyLayout>
  )
}

const Kontak = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="prose prose-sm">
        <h1>Kontak Kami</h1>
        <p>
          Kami di Mitra Rupikun selalu siap membantu Anda. Jika Anda memiliki
          pertanyaan, masukan, atau membutuhkan bantuan, jangan ragu untuk
          menghubungi kami melalui informasi kontak di bawah ini.
        </p>

        <h2>Informasi Kontak</h2>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:upkanid@gmail.com">upkanid@gmail.com</a>
          </li>
          <li>
            <strong>Telegram:</strong>{" "}
            <a href="https://t.me/ruprupi">@ruprupi</a>
          </li>
        </ul>

        <h2>Jam Operasional</h2>
        <p>
          Kami tersedia untuk membantu Anda pada jam operasional berikut:
          <ul>
            <li>Senin - Jumat: 08.00 - 17.00 WIB</li>
            <li>Sabtu: 09.00 - 14.00 WIB</li>
            <li>Minggu & Hari Libur: Tutup</li>
          </ul>
        </p>

        {/* <h2>Alamat</h2>
        <p>Saat ini hanya tersedia virtual saja :)</p> */}
        {/* <p>
          Jika Anda ingin mengunjungi kantor kami, berikut adalah alamat kami:
          <br />
          <strong>PT UpkanID</strong>
          <br />
          Jl. Contoh Alamat No. 123, Jakarta, Indonesia
        </p> */}
      </div>
    </div>
  );
};

