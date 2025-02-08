import { MyLayout } from "./_index";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Tentang Kami - Mitra UpkanID: Platform PPOB Terpercaya" },
        {
            name: "description",
            content:
                "Kenali Mitra UpkanID, platform PPOB terpercaya dari PT UpkanID. Kami menyediakan layanan pulsa, e-wallet, PLN, dan top up game. Bergabunglah menjadi mitra kami!",
        },
        {
            name: "keywords",
            content:
                "Mitra UpkanID, PPOB, pulsa, e-wallet, PLN, top up game, PT UpkanID, terpercaya, mitra PPOB",
        },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "Mitra UpkanID" },
        {
            property: "og:title",
            content: "Tentang Kami - Mitra UpkanID: Platform PPOB Terpercaya",
        },
        {
            property: "og:description",
            content:
                "Kenali Mitra UpkanID, platform PPOB terpercaya dari PT UpkanID. Kami menyediakan layanan pulsa, e-wallet, PLN, dan top up game. Bergabunglah menjadi mitra kami!",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://mitra.rupikun.com/tentang-kami" },
        {
            property: "og:image",
            content: "https://mitra.rupikun.com/logo-icon.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:title",
            content: "Tentang Kami - Mitra UpkanID: Platform PPOB Terpercaya",
        },
        {
            name: "twitter:description",
            content:
                "Kenali Mitra UpkanID, platform PPOB terpercaya dari PT UpkanID. Kami menyediakan layanan pulsa, e-wallet, PLN, dan top up game. Bergabunglah menjadi mitra kami!",
        },
        {
            name: "twitter:image",
            content: "https://mitra.rupikun.com/logo-icon.png"
        },
    ];
};


export default function tentangkami() {
    return <MyLayout>
        <div className="container mx-auto py-8 px-4">
            <div className="prose prose-sm">
                <h1>Tentang Kami - Mitra UpkanID</h1>

                <p>
                    Selamat datang di Mitra UpkanID, platform PPOB (Pembayaran Online)
                    terpercaya yang hadir untuk memudahkan transaksi Anda sehari-hari. Kami
                    menyediakan berbagai layanan, mulai dari pengisian pulsa, top up
                    e-wallet, pembayaran tagihan PLN, hingga top up game favorit Anda.
                </p>

                <h2>Misi Kami</h2>

                <p>
                    Misi kami adalah menjadi mitra terpercaya bagi Anda dalam memenuhi
                    kebutuhan transaksi digital. Kami berkomitmen untuk memberikan layanan
                    yang mudah, cepat, aman, dan menguntungkan bagi seluruh pengguna kami.
                </p>

                <h2>Mengapa Memilih Mitra UpkanID?</h2>

                <ul>
                    <li>
                        <strong>Terpercaya:</strong> Kami adalah mitra resmi dari PT UpkanID,
                        perusahaan yang berpengalaman dan terpercaya di bidang teknologi
                        finansial.
                    </li>
                    <li>
                        <strong>Layanan Lengkap:</strong> Kami menyediakan berbagai layanan
                        PPOB dan e-wallet dalam satu platform yang mudah digunakan.
                    </li>
                    <li>
                        <strong>Harga Bersaing:</strong> Kami menawarkan harga yang bersaing
                        dan menguntungkan bagi seluruh mitra dan pelanggan.
                    </li>
                    <li>
                        <strong>Transaksi Aman:</strong> Kami menggunakan teknologi keamanan
                        terkini untuk melindungi setiap transaksi Anda.
                    </li>
                    <li>
                        <strong>Dukungan Pelanggan:</strong> Tim dukungan pelanggan kami siap
                        membantu Anda 24/7.
                    </li>
                </ul>

                <h2>Mitra dari PT UpkanID</h2>

                <p>
                    Mitra UpkanID adalah bagian dari PT UpkanID, perusahaan yang memiliki
                    visi untuk memberikan solusi teknologi terbaik bagi masyarakat
                    Indonesia. Dengan dukungan dari PT UpkanID, kami terus berinovasi dan
                    meningkatkan kualitas layanan kami.
                </p>

                <h2>Bergabunglah dengan Mitra UpkanID!</h2>

                <p>
                    Kami mengundang Anda untuk bergabung menjadi mitra Mitra UpkanID dan
                    menikmati berbagai keuntungan yang kami tawarkan. Dengan menjadi mitra
                    kami, Anda dapat membuka peluang bisnis baru dan meningkatkan
                    pendapatan Anda.
                </p>

                <div className="mt-8 border-t pt-4">
                    <h2>Hubungi Kami</h2>
                    <p>
                        Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu
                        untuk menghubungi kami:
                    </p>
                    <p>
                        <strong>Email:</strong>
                        <a href="mailto:upkanid@gmail.com">upkanid@gmail.com</a>
                    </p>
                    <p>
                        <strong>Telegram:</strong>
                        <a href="https://t.me/ruprupi">@ruprupi</a>
                    </p>
                </div>
            </div>
        </div>
    </MyLayout>
}
